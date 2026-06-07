package com.mecapro.api.exception;

/**
 * Lanzada cuando un recurso no se encuentra en la BD.
 * Mapea a HTTP 404 Not Found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String entityName, Object id) {
        super(String.format("%s con id '%s' no fue encontrado.", entityName, id));
    }
}
