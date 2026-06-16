package it.thoson.GoURL.exception;

public class LinkNotFoundException extends RuntimeException {
    public LinkNotFoundException(String code) {
        super("Link not found: " + code);
    }
}
