package com.codeshare.dto.response;

import com.codeshare.dto.constants.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private boolean verified;
    private List<Role> roles;

    private Object profileData;
}
