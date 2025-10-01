import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { marcheId } = await req.json();
    
    if (!marcheId) {
      throw new Error('Marche ID is required');
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the marche data
    const { data: marche, error: fetchError } = await supabase
      .from('marches')
      .select('*')
      .eq('id', marcheId)
      .single();

    if (fetchError || !marche) {
      throw new Error('Marche not found');
    }

    console.log('Generating PDF for marche:', marche.title);

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    const fontSize = 12;
    const titleFontSize = 18;
    const labelFontSize = 10;
    
    let currentY = height - 50;
    
    // Header
    page.drawText('APPEL D\'OFFRES', {
      x: 50,
      y: currentY,
      size: titleFontSize,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    currentY -= 30;
    
    // Reference and date
    page.drawText(`Référence: ${marche.id}`, {
      x: 50,
      y: currentY,
      size: labelFontSize,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    page.drawText(`Date: ${new Date().toLocaleDateString('fr-FR')}`, {
      x: 350,
      y: currentY,
      size: labelFontSize,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    currentY -= 40;
    
    // Draw a line
    page.drawLine({
      start: { x: 50, y: currentY },
      end: { x: width - 50, y: currentY },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    currentY -= 30;
    
    // Helper function to add section
    const addSection = (label: string, content: string) => {
      if (currentY < 100) {
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        currentY = height - 50;
        return newPage;
      }
      
      page.drawText(label, {
        x: 50,
        y: currentY,
        size: fontSize,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      
      currentY -= 20;
      
      // Split long text into multiple lines
      const maxWidth = width - 100;
      const words = content.split(' ');
      let line = '';
      
      for (const word of words) {
        const testLine = line + word + ' ';
        const textWidth = helveticaFont.widthOfTextAtSize(testLine, fontSize);
        
        if (textWidth > maxWidth && line !== '') {
          page.drawText(line.trim(), {
            x: 50,
            y: currentY,
            size: fontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
          line = word + ' ';
          currentY -= 18;
        } else {
          line = testLine;
        }
      }
      
      if (line.trim() !== '') {
        page.drawText(line.trim(), {
          x: 50,
          y: currentY,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      }
      
      currentY -= 30;
    };
    
    // Add sections
    addSection('Titre:', marche.title);
    addSection('Secteur:', marche.sector || 'Non spécifié');
    addSection('Budget:', marche.budget || 'Non spécifié');
    addSection('Localisation:', marche.location || 'Non spécifiée');
    addSection('Date limite:', marche.end_date ? new Date(marche.end_date).toLocaleDateString('fr-FR') : 'Non spécifiée');
    
    if (marche.description) {
      addSection('Description:', marche.description);
    }
    
    if (marche.cahier_des_charges) {
      addSection('Cahier des charges:', marche.cahier_des_charges);
    }
    
    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    
    const fileName = `ao-${marcheId}-${Date.now()}.pdf`;
    const filePath = `${marche.created_by}/${fileName}`;

    // Upload the PDF to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, new Uint8Array(pdfBytes), {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Update the marche with the document path
    const currentDocuments = Array.isArray(marche.documents) ? marche.documents : [];
    const updatedDocuments = [
      ...currentDocuments,
      {
        name: `Appel d'Offres - ${marche.title}`,
        type: 'PDF',
        path: filePath,
        createdAt: new Date().toISOString()
      }
    ];

    const { error: updateError } = await supabase
      .from('marches')
      .update({ documents: updatedDocuments })
      .eq('id', marcheId);

    if (updateError) {
      console.error('Failed to update marche with document:', updateError);
      // Don't throw here, the file was uploaded successfully
    }

    console.log('PDF generated successfully:', fileName);

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentPath: filePath,
        message: 'PDF généré avec succès' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-ao-pdf function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});