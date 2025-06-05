// src/utils/helpers.js

export const generateId = (prefix = 'srv') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getServerCategoryDisplayName = (categoryValue) => {
    const displayNames = {
        ALL: "Todas as Categorias", FILE_SERVER: "File Server", DB_SERVER: "BD Server",
        REVERSE_PROXY_SERVER: "Reverso (Escudo)", BACKUP_SERVER: "Backup Server",
        EMAIL_SERVICE: "Serviço de Email", GENERIC: "Genérico / Outro"
    };
    return displayNames[categoryValue] || String(categoryValue).replace('_SERVER','').replace('_',' ');
};

export const getServerCategoryColor = (category) => {
    // Assuming Tailwind is not set up yet, return simple class names or codes
    // We'll adjust this later when setting up Tailwind/CSS
    const colors = {
        FILE_SERVER: 'blue',
        DB_SERVER: 'purple',
        REVERSE_PROXY_SERVER: 'cyan',
        BACKUP_SERVER: 'red',
        EMAIL_SERVICE: 'orange',
        GENERIC: 'gray',
        DEFAULT: 'black'
    };
    return colors[category] || colors.DEFAULT;
};

