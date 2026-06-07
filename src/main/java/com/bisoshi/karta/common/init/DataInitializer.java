package com.bisoshi.karta.common.init;
/*

import com.bisoshi.karta.modules.auth.model.Role;
import com.bisoshi.karta.modules.auth.model.User;
import com.bisoshi.karta.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@karta.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@karta.com");
            admin.setName("Admin User");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setActive(true);
            
            userRepository.save(admin);
            System.out.println("========================================");
            System.out.println("USUARIO ADMIN CREADO EXITOSAMENTE");
            System.out.println("Email: admin@karta.com");
            System.out.println("Password: admin123");
            System.out.println("========================================");
        } else {
            System.out.println("Usuario admin ya existe en la base de datos");
        }
    }
}

*/