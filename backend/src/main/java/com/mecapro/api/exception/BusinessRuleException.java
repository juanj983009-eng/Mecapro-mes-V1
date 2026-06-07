package com.mecapro.api.exception;

/**
 * Lanzada cuando se viola una regla de negocio (ej: exceso de tiempo sin justificación).
 * Mapea a HTTP 400 Bad Request.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
