"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/core/presentation/components/ui/dialog";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Label } from "@/src/core/presentation/components/ui/label";
import {
  FileText,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { Asset } from "../../domain/entities";

interface Props {
  asset: Asset;
  onAdd: (assetId: string, certificates: { file: File; name: string }[]) => Promise<void>;
}

export function AddCertificateModal({ asset, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [certificates, setCertificates] = useState<{ id: string; file: File; name: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateAndAddFiles = (selectedFiles: FileList | File[]) => {
    setError(null);
    const newCerts: { id: string; file: File; name: string }[] = [];
    let hasError = false;

    Array.from(selectedFiles).forEach((selectedFile) => {
      const isPdf = selectedFile.type === "application/pdf";
      const isImage = selectedFile.type.startsWith("image/");
      
      if (!isPdf && !isImage) {
        hasError = true;
        return;
      }
      
      const defaultName = selectedFile.name.replace(/\.[^/.]+$/, "");
      newCerts.push({
        id: Math.random().toString(36).substring(7),
        file: selectedFile,
        name: defaultName,
      });
    });

    if (hasError) {
      setError("Algunos archivos fueron ignorados. Solo se permiten archivos PDF o imágenes.");
    }

    if (newCerts.length > 0) {
      setCertificates((prev) => [...prev, ...newCerts]);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndAddFiles(e.dataTransfer.files);
      }
    },
    [],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      // Reset input so the same files can be selected again if removed
      e.target.value = "";
    }
  };

  const updateCertificateName = (id: string, newName: string) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const removeCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (certificates.length === 0) return;

    // Validate that all have names
    if (certificates.some(c => !c.name.trim())) {
      setError("Todos los certificados deben tener un nombre.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = certificates.map(c => ({ file: c.file, name: c.name.trim() }));
      await onAdd(asset.id, payload);

      setOpen(false);
      setCertificates([]);
      setError(null);
    } catch (err) {
      console.error("Error adding certificates:", err);
      setError("Error al cargar los certificados. Intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        setCertificates([]);
        setError(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 text-xs font-bold uppercase tracking-wider h-8"
        >
          <Plus className="size-3.5" />
          Agregar Certificado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-card border-border p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 bg-secondary/10 border-b border-border shrink-0">
          <DialogTitle className="font-mono text-xl flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Cargar Certificados
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sube certificados oficiales (PDF o imagen) para el activo{" "}
            <span className="font-mono text-foreground font-bold">
              {asset.code}
            </span>
            . Puedes seleccionar varios archivos a la vez.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Archivos ({certificates.length} seleccionados)
            </Label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all
                ${isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border bg-secondary/10"}
              `}
            >
              <input
                type="file"
                accept=".pdf,image/*"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="size-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Arrastra archivos aquí o haz clic para buscar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos permitidos: PDF, JPG, PNG
                </p>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in slide-in-from-top-1">
                <AlertCircle className="size-3 shrink-0" />
                {error}
              </p>
            )}

            {certificates.length > 0 && (
              <div className="flex flex-col gap-3 mt-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="flex flex-col gap-2 p-4 rounded-xl border border-primary/20 bg-primary/5 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {cert.file.type === "application/pdf" ? (
                            <FileText className="size-5 text-primary" />
                          ) : (
                            <ImageIcon className="size-5 text-primary" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">
                            {cert.file.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {(cert.file.size / (1024 * 1024)).toFixed(2)} MB • {cert.file.type.split('/')[1] || "FILE"}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => removeCertificate(cert.id)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="mt-2">
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Nombre a guardar</Label>
                       <Input 
                         value={cert.name}
                         onChange={(e) => updateCertificateName(cert.id, e.target.value)}
                         className="h-9 bg-background/50 border-primary/20"
                         placeholder="Ingresa un nombre..."
                       />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 gap-3 border-t border-border bg-secondary/5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="border border-border text-xs uppercase font-bold tracking-widest h-10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || certificates.length === 0}
            className="min-w-[160px] text-xs uppercase font-bold tracking-widest h-10 shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Cargando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                Subir Certificados
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
