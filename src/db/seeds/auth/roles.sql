REPLACE INTO `roles` (`id`, `info`)
    VALUES (
        'admin',
        'Usuario con todos los permisos del sistema'
    ),
    (
        'editor',
        'Usuario con permisos para crear y editar contenido, pero sin acceso a configuraciones avanzadas'
    ),
    (
        'viewer',
        'Usuario con permisos solo para ver contenido, sin capacidad de edición'
    );
    