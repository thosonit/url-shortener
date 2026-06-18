package it.thoson.ShortLink.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.springframework.stereotype.Service;

@Service
public class CodeGeneratorService {

    private static final String ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    private static final int BASE = ALPHABET.length();
    private static final int DEFAULT_LENGTH = 7;

    public String generate(String url) {
        return generate(url, DEFAULT_LENGTH);
    }

    public String generate(String url, int length) {
        if (url == null || url.isBlank()) throw new IllegalArgumentException("url must not be blank");
        if (length < 1 || length > 12) throw new IllegalArgumentException("length must be between 1 and 12");

        byte[] hash = sha256(url);

        long value = 0;
        for (int i = 0; i < 8; i++) {
            value = (value << 8) | (hash[i] & 0xFF);
        }
        value = Math.abs(value);

        var sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(ALPHABET.charAt((int) (value % BASE)));
            value /= BASE;
        }
        return sb.reverse().toString();
    }

    private byte[] sha256(String input) {
        try {
            return MessageDigest.getInstance("SHA-256")
                    .digest(input.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
