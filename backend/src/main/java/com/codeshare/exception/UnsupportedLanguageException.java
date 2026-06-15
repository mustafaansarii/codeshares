package com.codeshare.exception;

public class UnsupportedLanguageException extends CodeExecutionException {
    public UnsupportedLanguageException(String language) {
        super("Unsupported language: " + language);
    }
}
