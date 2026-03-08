import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  className?: string;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const PhotoUpload = ({ value, onChange, className }: Props) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError("");
      if (!ACCEPTED.includes(file.type)) {
        setError("Only JPG, PNG, WebP, and GIF images are allowed.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("File must be under 5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Student photo" className="h-32 w-32 rounded-xl border object-cover shadow-card" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-transform hover:scale-110"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          whileHover={{ scale: 1.01 }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <div className={cn("mb-3 flex h-12 w-12 items-center justify-center rounded-xl", dragOver ? "gradient-primary" : "bg-secondary")}>
            {dragOver ? (
              <Upload className="h-6 w-6 text-primary-foreground" />
            ) : (
              <ImageIcon className="h-6 w-6 text-secondary-foreground" />
            )}
          </div>
          <p className="text-sm font-medium">
            {dragOver ? "Drop image here" : "Drag & drop or click to upload"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP, GIF · Max 5 MB</p>
        </motion.div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default PhotoUpload;
