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
} from "lucide-react";
import { Asset } from "../../domain/entities";

interface Props {
  asset: Asset;
  onAdd: (assetId: string, certificate: any) => Promise<void>;
}

export function AddCertificateModal({ asset, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
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

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF.");
      return;
    }
    setFile(selectedFile);
    if (!name) {
      // Auto-fill name from filename without extension
      setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndSetFile(e.dataTransfer.files[0]);
      }
    },
    [name],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) return;

    setIsLoading(true);
    try {
      // Mocking file upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await onAdd(asset.id, {
        name,
        fileUrl: "/certificates/new-upload.pdf", // Mock URL
      });

      setOpen(false);
      // Reset form
      setName("");
      setFile(null);
      setError(null);
    } catch (err) {
      console.error("Error adding certificate:", err);
      setError("Error al cargar el certificado. Intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 text-xs font-bold uppercase tracking-wider h-8"
        >
          <Plus className="size-3.5" />
          Agregar Certificado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-secondary/10 border-b border-border">
          <DialogTitle className="font-mono text-xl flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Cargar Certificado
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sube un certificado oficial en formato PDF para el activo{" "}
            <span className="font-mono text-foreground font-bold">
              {asset.code}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="cert-name"
              className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold"
            >
              Nombre del Certificado
            </Label>
            <Input
              id="cert-name"
              placeholder="Ej: Inspección Anual 2026"
              className="bg-secondary/20 border-border h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Archivo Digital (PDF)
            </Label>

            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-all
                  ${isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border bg-secondary/10"}
                  ${error ? "border-red-500/50" : ""}
                `}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="size-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Arrastra el archivo aquí o haz clic para buscar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Solo archivos PDF (Máx. 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground truncate max-w-[240px]">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-red-500"
                  onClick={() => setFile(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in slide-in-from-top-1">
                <AlertCircle className="size-3" />
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="border border-border text-xs uppercase font-bold tracking-widest h-10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !file || !name}
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
                  Subir Certificado
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
