package it.thoson.GoURL.exception;

public class InvalidUrlException extends RuntimeException {
    public InvalidUrlException(String url) {
        super("Invalid URL: " + url);
    }
}
