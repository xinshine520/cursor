package com.hyai.repository;

import com.hyai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByUsernameAndDeletedAtIsNull(String username);
    
    boolean existsByUsername(String username);
    
    @Query("SELECT u FROM User u WHERE u.id = ?1 AND u.deletedAt IS NULL")
    Optional<User> findByIdAndNotDeleted(Long id);
}
