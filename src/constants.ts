// Define content type arrays first
export const jsonTypes = [
    'application/json',
    'application/ld+json', // JSON-LD (Linked Data) - structured data format
    'application/vnd.api+json', // JSON API - REST API specification format
  ] as const;
  
  export const xmlTypes = [
    'application/xml',
    'text/xml',
    'application/atom+xml', // Atom feeds - syndication format
    'application/rss+xml', // RSS feeds - Really Simple Syndication
    'application/soap+xml', // SOAP - Simple Object Access Protocol
  ] as const;
  
  export const textTypes = [
    'text/plain',
    'text/html',
    'text/css',
    'text/csv',
    'text/tab-separated-values', // TSV - Tab Separated Values
    'text/javascript',
    'application/javascript',
    'application/x-javascript',
    'application/x-sh', // Shell scripts
    'application/x-shellscript', // Shell scripts
    'application/xhtml+xml', // XHTML - XML-based HTML
    'application/csv',
    'application/x-www-form-urlencoded', // URL-encoded form data
    'multipart/form-data', // Multipart form data (file uploads)
  ] as const;
  
  export const binaryTypes = [
    'application/octet-stream', // Generic binary data
    'application/pdf', // PDF documents
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/svg+xml', // SVG - Scalable Vector Graphics
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/avi',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'application/zip', // ZIP archives
    'application/x-tar', // TAR archives
    'application/gzip', // GZIP compressed files
    'application/x-gzip', // Alternative GZIP MIME type
  ] as const;
  
  // Additional content types that don't fit into the main categories
  export const additionalTypes = [
    'text/markdown', // Markdown files
    'application/yaml', // YAML files
    'text/yaml', // Alternative YAML MIME type
    'application/xml-dtd', // XML DTD files
    'text/vcard', // vCard files
    'application/vcard+json', // vCard JSON format
  ] as const;
  