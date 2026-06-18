package com.codeshare.dto.collab;

import com.fasterxml.jackson.annotation.JsonProperty;

public record WsTicketResponse(
        @JsonProperty("ticket") String ticket
) {
}
