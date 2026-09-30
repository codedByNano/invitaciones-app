CREATE DATABASE IF NOT EXISTS invitaciones CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

USE invitaciones;

CREATE TABLE
    agencies (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        is_active TINYINT (1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE = InnoDB;

CREATE TABLE
    events (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        agency_id INT UNSIGNED NOT NULL,
        slug VARCHAR(120) NOT NULL UNIQUE,
        honoree_name VARCHAR(150) NOT NULL,
        event_date DATETIME NOT NULL,
        dress_code VARCHAR(100) NULL,
        status ENUM ('draft', 'published', 'cancelled') NOT NULL DEFAULT 'draft',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_events_agency FOREIGN KEY (agency_id) REFERENCES agencies (id) ON DELETE CASCADE,
        INDEX idx_events_agency_date (agency_id, event_date)
    ) ENGINE = InnoDB;

CREATE TABLE
    gallery_images (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        event_id INT UNSIGNED NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_gallery_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
        INDEX idx_gallery_event_order (event_id, sort_order)
    ) ENGINE = InnoDB;

CREATE TABLE
    transfer_info (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        event_id INT UNSIGNED NOT NULL UNIQUE,
        alias VARCHAR(100) NULL,
        cbu VARCHAR(30) NULL,
        bank_name VARCHAR(100) NULL,
        holder_name VARCHAR(150) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_transfer_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
    ) ENGINE = InnoDB;

CREATE TABLE
    gift_list_items (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        event_id INT UNSIGNED NOT NULL,
        name VARCHAR(200) NOT NULL,
        url VARCHAR(500) NULL,
        price DECIMAL(12, 2) NULL,
        reserved TINYINT (1) NOT NULL DEFAULT 0,
        reserved_by VARCHAR(150) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_gifts_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
        INDEX idx_gifts_event (event_id)
    ) ENGINE = InnoDB;

CREATE TABLE
    rsvp_responses (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        event_id INT UNSIGNED NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(190) NOT NULL,
        phone VARCHAR(40) NULL,
        dietary_option ENUM (
            'standard',
            'vegetarian',
            'vegan',
            'celiac',
            'other'
        ) NOT NULL DEFAULT 'standard',
        dietary_notes VARCHAR(300) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_rsvp_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
        UNIQUE KEY uq_rsvp_event_email (event_id, email),
        INDEX idx_rsvp_event_diet (event_id, dietary_option)
    ) ENGINE = InnoDB;