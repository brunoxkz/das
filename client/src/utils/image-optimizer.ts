/**
 * IMAGE OPTIMIZATION UTILITIES
 * Otimização automática de imagens com WebP, lazy loading e compressão
 */

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  maxWidth?: number;
  maxHeight?: number;
  lazy?: boolean;
  placeholder?: 'blur' | 'color' | 'none';
}

interface OptimizedImage {
  src: string;
  webpSrc?: string;
  placeholder?: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * CONVERTER IMAGEM PARA WebP
 */
export async function convertToWebP(
  file: File, 
  quality: number = 0.8
): Promise<{ webpBlob: Blob; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (webpBlob) => {
          if (webpBlob) {
            resolve({
              webpBlob,
              originalSize: file.size,
              compressedSize: webpBlob.size
            });
          } else {
            reject(new Error('Falha na conversão WebP'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * REDIMENSIONAR IMAGEM
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular dimensões mantendo aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      
      // Configurar qualidade de renderização
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Falha no redimensionamento'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * GERAR PLACEHOLDER BLUR
 */
export async function generateBlurPlaceholder(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Placeholder muito pequeno (10x10)
      canvas.width = 10;
      canvas.height = 10;
      
      if (ctx) {
        ctx.filter = 'blur(2px)';
        ctx.drawImage(img, 0, 0, 10, 10);
      }
      
      const placeholder = canvas.toDataURL('image/jpeg', 0.1);
      resolve(placeholder);
    };

    img.onerror = () => reject(new Error('Falha ao gerar placeholder'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * OTIMIZAÇÃO COMPLETA DE IMAGEM
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const {
    quality = 0.8,
    format = 'auto',
    maxWidth = 1920,
    maxHeight = 1080,
    placeholder = 'blur'
  } = options;

  try {
    // 1. Redimensionar se necessário
    let processedFile = file;
    if (file.size > 1024 * 1024) { // > 1MB
      const resizedBlob = await resizeImage(file, maxWidth, maxHeight, quality);
      processedFile = new File([resizedBlob], file.name, { type: file.type });
    }

    // 2. Converter para WebP se suportado e solicitado
    let webpSrc: string | undefined;
    let finalBlob = processedFile;

    if ((format === 'webp' || format === 'auto') && supportsWebP()) {
      try {
        const { webpBlob } = await convertToWebP(processedFile, quality);
        finalBlob = new File([webpBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
          type: 'image/webp'
        });
        webpSrc = URL.createObjectURL(webpBlob);
      } catch (error) {
        console.warn('WebP conversion failed, using original format');
      }
    }

    // 3. Gerar placeholder se solicitado
    let placeholderSrc: string | undefined;
    if (placeholder === 'blur') {
      try {
        placeholderSrc = await generateBlurPlaceholder(file);
      } catch (error) {
        console.warn('Placeholder generation failed');
      }
    } else if (placeholder === 'color') {
      placeholderSrc = 'data:image/svg+xml;base64,' + btoa(
        '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>'
      );
    }

    // 4. Obter dimensões
    const { width, height } = await getImageDimensions(file);

    return {
      src: URL.createObjectURL(finalBlob),
      webpSrc,
      placeholder: placeholderSrc,
      width,
      height,
      format: finalBlob.type,
      size: finalBlob.size
    };

  } catch (error) {
    console.error('Image optimization failed:', error);
    
    // Fallback para imagem original
    const { width, height } = await getImageDimensions(file);
    return {
      src: URL.createObjectURL(file),
      width,
      height,
      format: file.type,
      size: file.size
    };
  }
}

/**
 * VERIFICAR SUPORTE A WebP
 */
function supportsWebP(): boolean {
  if (typeof document === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
}

/**
 * OBTER DIMENSÕES DA IMAGEM
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => reject(new Error('Falha ao obter dimensões'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * LAZY LOADING COM INTERSECTION OBSERVER
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private loadedImages = new Set<string>();

  constructor() {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target as HTMLImageElement);
            }
          });
        },
        {
          rootMargin: '50px' // Carregar 50px antes de aparecer
        }
      );
    }
  }

  observe(img: HTMLImageElement) {
    if (this.observer && !this.loadedImages.has(img.src)) {
      this.observer.observe(img);
    }
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (src && !this.loadedImages.has(src)) {
      img.src = src;
      if (srcset) img.srcset = srcset;
      
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      
      this.loadedImages.add(src);
      this.observer?.unobserve(img);
    }
  }

  disconnect() {
    this.observer?.disconnect();
    this.loadedImages.clear();
  }
}

// Singleton instance
export const lazyImageLoader = new LazyImageLoader();

/**
 * HOOK PARA OTIMIZAÇÃO DE IMAGENS
 */
import { useState, useCallback } from 'react';

export function useImageOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  const optimizeImages = useCallback(async (
    files: FileList | File[],
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage[]> => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    const fileArray = Array.from(files);
    const results: OptimizedImage[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      try {
        const optimized = await optimizeImage(file, options);
        results.push(optimized);
      } catch (error) {
        console.error(`Failed to optimize ${file.name}:`, error);
      }

      setOptimizationProgress(((i + 1) / fileArray.length) * 100);
    }

    setIsOptimizing(false);
    return results;
  }, []);

  return {
    optimizeImages,
    isOptimizing,
    optimizationProgress
  };
}