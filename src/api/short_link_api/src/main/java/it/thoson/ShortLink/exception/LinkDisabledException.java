package it.thoson.ShortLink.exception;

public class LinkDisabledException extends RuntimeException {
    public LinkDisabledException(String code) {
        super("Link is disabled: " + code);
    }
}
