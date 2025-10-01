import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Trash2, FileText, Image, File } from "lucide-react";
import { StoredDocument } from "@/hooks/useDocuments";
import { useState } from "react";

interface DocumentsWidgetCardProps {
  document: StoredDocument;
  onDelete: (fileName: string) => void;
}

export function DocumentsWidgetCard({ document, onDelete }: DocumentsWidgetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'Image';
    } else if (['pdf'].includes(extension || '')) {
      return 'PDF';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return 'Document';
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return 'Tableur';
    } else {
      return 'Fichier';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString('fr-FR');
    } catch {
      return "—";
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(document.name);
    } finally {
      setIsDeleting(false);
    }
  };

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
    document.name.split('.').pop()?.toLowerCase() || ''
  );

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow p-3">
      <CardHeader className="p-0 pb-2">
        <div className="flex items-center gap-1.5">
          {getFileIcon(document.name)}
          <h3 className="font-normal text-xs text-foreground truncate leading-tight flex-1 tracking-tight" title={document.name}>
            {document.name}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Preview pour les images */}
        {isImage && document.publicUrl && (
          <div className="mb-2">
            <img 
              src={document.publicUrl} 
              alt={document.name}
              className="w-full h-16 object-cover rounded border border-border/50"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{formatFileSize(document.size)}</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <span>Ajouté le {formatDate(document.created_at)}</span>
          </div>
          
          <div className="flex items-center gap-1 pt-1">
            {document.publicUrl && (
              <Button
                variant="ghost" 
                size="xs"
                asChild
                className="h-5 px-1.5 text-xs"
              >
                <a href={document.publicUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3 mr-1" />
                  Télécharger
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="xs"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-5 px-1.5 text-xs text-white hover:text-white/90"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              {isDeleting ? "..." : "Supprimer"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}