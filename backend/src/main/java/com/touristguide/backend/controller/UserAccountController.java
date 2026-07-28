package com.touristguide.backend.controller;

import jakarta.validation.Valid;

import com.touristguide.backend.model.UserAccount;
import com.touristguide.backend.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.touristguide.backend.exception.ResourceNotFoundException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserAccountController {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public UserAccountController(UserAccountRepository userAccountRepository,
                                 PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Lists all users for the admin "Manage Users" table.
    // Returns id/name/email/username/role only - never the password hash.
    @GetMapping
    public List<Map<String, Object>> getAllUsers() {
        return userAccountRepository.findAll().stream()
                .map(user -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", user.getId());
                    data.put("name", user.getName());
                    data.put("email", user.getEmail());
                    data.put("username", user.getUsername());
                    data.put("role", user.getRole());
                    return data;
                })
                .collect(Collectors.toList());
    }

    @PostMapping("/register")
    public UserAccount register(@Valid @RequestBody UserAccount user) {

        // Stop duplicate accounts before they happen, with a clear message
        // instead of a raw database constraint crash.
        if (userAccountRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("An account with this email already exists. Please login instead.");
        }

        // Public registration flows that don't collect a role still work,
        // since UserAccount defaults role to "User" if not provided.
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        return userAccountRepository.save(user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody UserAccount loginRequest) {
        UserAccount existingUser = userAccountRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        boolean passwordMatches = passwordEncoder.matches(
                loginRequest.getPassword(),
                existingUser.getPassword()
        );

        if (!passwordMatches) {
            throw new RuntimeException("Invalid email or password");
        }

        // Return real JSON (never the password hash) instead of a plain
        // string, so login.js can read data.id / data.name / data.email.
        Map<String, Object> result = new HashMap<>();
        result.put("id", existingUser.getId());
        result.put("name", existingUser.getName());
        result.put("email", existingUser.getEmail());
        result.put("username", existingUser.getUsername());
        result.put("role", existingUser.getRole());
        return result;
    }

    @PutMapping("/{id}/status")
    public Map<String, Object> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        UserAccount user = userAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String status = body.get("status");
        if (status == null || (!status.equals("Active") && !status.equals("Blocked"))) {
            throw new RuntimeException("Status must be either 'Active' or 'Blocked'");
        }

        user.setStatus(status);
        userAccountRepository.save(user);

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("status", user.getStatus());
        return data;
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateUser(@PathVariable Long id, @RequestBody Map<String, String> updates) {

        UserAccount user = userAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (updates.containsKey("name")) {
            user.setName(updates.get("name"));
        }
        if (updates.containsKey("email")) {
            user.setEmail(updates.get("email"));
        }
        if (updates.containsKey("username")) {
            user.setUsername(updates.get("username"));
        }
        if (updates.containsKey("role")) {
            user.setRole(updates.get("role"));
        }
        if (updates.containsKey("password") && updates.get("password") != null && !updates.get("password").isBlank()) {
            user.setPassword(passwordEncoder.encode(updates.get("password")));
        }

        userAccountRepository.save(user);

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("name", user.getName());
        data.put("email", user.getEmail());
        data.put("username", user.getUsername());
        data.put("role", user.getRole());
        return data;
    }
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        if (!userAccountRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userAccountRepository.deleteById(id);
        return "User deleted successfully";
    }

    // Fetches a single user for editing - returns id/name/email/username/role only,
// never the password hash, same as getAllUsers().
    @GetMapping("/{id}")
    public Map<String, Object> getUserById(@PathVariable Long id) {
        UserAccount user = userAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("name", user.getName());
        data.put("email", user.getEmail());
        data.put("username", user.getUsername());
        data.put("role", user.getRole());
        return data;
    }
}