package com.codeshare.dto.constants;

/** Access a user has to a file. OWNER is implicit (the file's ownerEmail); shares grant VIEW or EDIT. */
public enum FileAccess {
    NONE,
    VIEW,
    EDIT,
    OWNER;

    public boolean canView() {
        return this != NONE;
    }

    public boolean canEdit() {
        return this == EDIT || this == OWNER;
    }
}
