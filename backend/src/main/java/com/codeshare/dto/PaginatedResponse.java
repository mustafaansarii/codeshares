package com.codeshare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginatedResponse<T> {
    private String status;
    private String message;
    private List<T> data;
    private Integer count;       // items on this page
    private Long totalItems;     // total matching records
    private Integer totalPages;
    private Integer page;
    private Integer pageSize;
    private Integer code;

    @JsonProperty("timestamp")
    private Instant timestamp;

    public static <T> PaginatedResponse<T> success(List<T> data, Integer count, String message) {
        return PaginatedResponse.<T>builder()
                .status("success")
                .message(message)
                .data(data)
                .count(count)
                .code(200)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> PaginatedResponse<T> success(List<T> data, Integer count) {
        return PaginatedResponse.<T>builder()
                .status("success")
                .data(data)
                .count(count)
                .code(200)
                .timestamp(Instant.now())
                .build();
    }
}
