package it.thoson.GoURL.exception;

public class LinkDisabledException extends RuntimeException {
    public LinkDisabledException(String code) {
        super("Link is disabled: " + code);
    }
}
