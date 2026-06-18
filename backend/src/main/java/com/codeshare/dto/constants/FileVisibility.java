package com.codeshare.dto.constants;

public enum FileVisibility {
    /** Anyone with the link can view (read-only); editing still requires owner/EDIT share. */
    PUBLIC,
    /** Only the owner and explicitly-shared users can access. */
    PRIVATE
}
