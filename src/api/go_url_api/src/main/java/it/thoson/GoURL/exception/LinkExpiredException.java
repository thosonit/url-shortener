package it.thoson.GoURL.exception;

public class LinkExpiredException extends RuntimeException {
    public LinkExpiredException(String code) {
        super("Link has expired: " + code);
    }
}
