package it.thoson.GoURL.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import it.thoson.GoURL.domain.entity.User;

public interface UserRepository extends JpaRepository<User, String> {
    public User findByEmail(String email);

    public boolean existsByEmail(String email);
}
