import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ControlButton } from "@/components/ui/control-button";
import { SectionHeader } from "@/components/ui/section-header";
import { Download, Trash2, Upload, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useDocuments } from "@/hooks/useDocuments";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import { DocumentsWidgetCard } from "@/components/DocumentsWidgetCard";

interface DocumentsListProps {
  searchTerm?: string;
  fileType?: string;
  view?: "widget" | "list";
}

export function DocumentsList({ searchTerm = "", fileType = "all", view = "list" }: DocumentsListProps) {
  const { documents, loading, uploadDocument, deleteDocument } = useDocuments();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    try {
      await uploadDocument(file);
      toast({
        title: "Document uploadé",
        description: "Le document a été ajouté avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le document.",
        variant: "destructive",
      });
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      await deleteDocument(fileName);
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filtrer les documents
  const filteredDocuments = documents.filter((doc) => {
    // Filtre par terme de recherche
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par type de fichier
    const extension = doc.name.split('.').pop()?.toLowerCase() || '';
    let matchesType = true;
    
    if (fileType !== "all") {
      switch (fileType) {
        case "image":
          matchesType = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
          break;
        case "pdf":
          matchesType = extension === 'pdf';
          break;
        case "document":
          matchesType = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(extension);
          break;
        case "other":
          matchesType = !['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(extension);
          break;
      }
    }
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredDocuments.length === 0 && documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Aucun document"
        description="Commencez par ajouter vos premiers documents en cliquant sur le bouton ci-dessous."
        actionLabel="Ajouter un document"
        onAction={() => fileInputRef.current?.click()}
        variant="minimal"
      />
    );
  }

  if (filteredDocuments.length === 0 && documents.length > 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Aucun document trouvé"
        description="Aucun document ne correspond aux filtres sélectionnés."
        variant="minimal"
      />
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Documents stockés"
        action={
          <ControlButton onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Ajouter un document
          </ControlButton>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
      />

      {view === "widget" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDocuments.map((document) => (
            <DocumentsWidgetCard 
              key={document.id} 
              document={document} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-muted rounded">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-normal truncate tracking-tight">{document.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(document.size)} • {new Date(document.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {document.publicUrl && (
                    <ControlButton variant="outline" asChild>
                      <a href={document.publicUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </a>
                    </ControlButton>
                  )}
                  <ControlButton
                    variant="outline"
                    onClick={() => handleDelete(document.name)}
                    className="text-white hover:text-white/90"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </ControlButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}