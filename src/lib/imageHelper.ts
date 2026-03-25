export const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    
    // Si ya es una URL de datos base64 o una URL absoluta, usarla directamente
    if (url.startsWith('data:image') || url.startsWith('http')) {
        return url;
    }
    
    // Si es una ruta que empieza por /uploads/, extraer el nombre del archivo
    if (url.startsWith('/uploads/')) {
        return `/api/uploads/${url.split('/').pop()}`;
    }
    
    // Por defecto, intentar servirlo desde la API si parece un nombre de archivo
    return `/api/uploads/${url.split('/').pop()}`;
};
