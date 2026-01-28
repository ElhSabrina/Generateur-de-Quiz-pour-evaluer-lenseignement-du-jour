-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3307
-- Généré le : dim. 07 déc. 2025 à 16:34
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `checkyourteaching`
--

-- --------------------------------------------------------

--
-- Structure de la table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `option_a` varchar(255) NOT NULL,
  `option_b` varchar(255) NOT NULL,
  `option_c` varchar(255) NOT NULL,
  `option_d` varchar(255) NOT NULL,
  `correct_option` enum('A','B','C','D') NOT NULL,
  `topic_tag` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `questions`
--

INSERT INTO `questions` (`id`, `quiz_id`, `text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `topic_tag`) VALUES
(48, 42, 'What does the intersection of two circles related to impedance represent?', 'The value of resistance (R)', 'The value of reactance (X)', 'The impedance value', 'The reduced impedance', 'C', 'ai_generated'),
(49, 42, 'In the context of the course material, what does \'L0\' likely refer to?', 'The initial value of inductance', 'The wavelength', 'The period', 'The impedance value', 'A', 'ai_generated'),
(50, 42, 'If impedance is not \'nnn\', what is described?', 'The ratio of lambda to T', 'The value of resistance', 'The value of reactance', 'The intersection of circles', 'A', 'ai_generated'),
(51, 42, 'What is \'T\' likely referring to in the context of the course material?', 'Temperature', 'Time period', 'The impedance', 'Wavelength', 'B', 'ai_generated'),
(52, 42, 'Which of the following is most likely related to the calculation or determination of L0?', 'Delta', 'The intersection point', 'Lambda/T', 'R and X', 'A', 'ai_generated'),
(53, 43, 'What does \'impedance\' relate to in the context of the course material?', 'Reducing resistance (R) and reactance (X).', 'Calculating the delta of an equation.', 'Determining the speed of light.', 'Measuring the wavelength (lambda).', 'A', 'ai_generated'),
(54, 43, 'What are the two solutions when dealing with impedance?', 'They involve circles intersecting at the impedance point.', 'They are always imaginary numbers.', 'They are related to \'lambda\' over \'T\'.', 'They deal with personal taste and film.', 'A', 'ai_generated'),
(55, 43, 'What is calculated after finding the two impedance solutions?', 'L0 with delta.', 'The speed of light.', 'Personal taste.', 'The wavelength.', 'A', 'ai_generated'),
(56, 43, 'What does \'lambda\' over \'T\' relate to?', 'Impedance.', 'If the impedance is not present.', 'The solo image.', 'Personal degout.', 'B', 'ai_generated'),
(57, 43, 'What is a key step after getting L0?', 'Verifying the result, e.g., 0.25.', 'Finding the wavelength.', 'Checking personal degout.', 'Watching a film.', 'A', 'ai_generated'),
(58, 28, 'Question', 'A', 'B', 'C', 'D', 'A', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `code` varchar(10) NOT NULL,
  `status` enum('draft','open','closed') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `quizzes`
--

INSERT INTO `quizzes` (`id`, `teacher_id`, `subject_id`, `title`, `code`, `status`, `created_at`) VALUES
(28, 1, 1, 'relativity ', '457204', 'closed', '2025-12-07 08:20:13'),
(42, 1, 1, 'test', '811745', 'closed', '2025-12-07 10:04:33'),
(43, 1, 1, 'test', '924688', 'closed', '2025-12-07 10:04:56');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `score` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `quiz_attempts`
--

INSERT INTO `quiz_attempts` (`id`, `quiz_id`, `student_id`, `score`, `created_at`) VALUES
(2, 43, 2, 2, '2025-12-07 10:05:28'),
(3, 43, 3, 2, '2025-12-07 10:06:03'),
(4, 43, 4, 3, '2025-12-07 10:06:38'),
(5, 42, 2, 2, '2025-12-07 10:17:45'),
(6, 28, 2, 1, '2025-12-07 14:01:52');

-- --------------------------------------------------------

--
-- Structure de la table `student_answers`
--

CREATE TABLE `student_answers` (
  `id` int(11) NOT NULL,
  `attempt_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `selected_option` enum('A','B','C','D') NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `answered_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `student_answers`
--

INSERT INTO `student_answers` (`id`, `attempt_id`, `question_id`, `selected_option`, `is_correct`, `answered_at`) VALUES
(2, 2, 53, 'B', 0, '2025-12-07 10:05:28'),
(3, 2, 54, 'A', 1, '2025-12-07 10:05:28'),
(4, 2, 55, 'C', 0, '2025-12-07 10:05:28'),
(5, 2, 56, 'C', 0, '2025-12-07 10:05:28'),
(6, 2, 57, 'A', 1, '2025-12-07 10:05:28'),
(7, 3, 53, 'B', 0, '2025-12-07 10:06:03'),
(8, 3, 54, 'D', 0, '2025-12-07 10:06:03'),
(9, 3, 55, 'A', 1, '2025-12-07 10:06:03'),
(10, 3, 56, 'D', 0, '2025-12-07 10:06:03'),
(11, 3, 57, 'A', 1, '2025-12-07 10:06:03'),
(12, 4, 53, 'D', 0, '2025-12-07 10:06:38'),
(13, 4, 54, 'A', 1, '2025-12-07 10:06:38'),
(14, 4, 55, 'D', 0, '2025-12-07 10:06:38'),
(15, 4, 56, 'B', 1, '2025-12-07 10:06:38'),
(16, 4, 57, 'A', 1, '2025-12-07 10:06:38'),
(17, 5, 48, 'D', 0, '2025-12-07 10:17:45'),
(18, 5, 49, 'C', 0, '2025-12-07 10:17:45'),
(19, 5, 50, 'A', 1, '2025-12-07 10:17:45'),
(20, 5, 51, 'A', 0, '2025-12-07 10:17:45'),
(21, 5, 52, 'A', 1, '2025-12-07 10:17:45'),
(22, 6, 58, 'A', 1, '2025-12-07 14:01:52');

-- --------------------------------------------------------

--
-- Structure de la table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `subjects`
--

INSERT INTO `subjects` (`id`, `teacher_id`, `name`) VALUES
(1, 1, 'Physics'),
(2, 1, 'mathematics');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('teacher','student') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `created_at`) VALUES
(1, 'teacher1', 'teacher@gmail.com', '$2b$10$hwocOdYsgAR9xa0l/5TjXerldVdomTKKC9Ci01CCTQtYLafpckI6G', 'teacher', '2025-12-06 04:25:44'),
(2, 'student1', 'student@gmail.com', '$2b$10$.n4b0N3pnPR5s2Ho95.aD.8xlY1s7YdXXxX8UpoBG05AKnAY/rAZa', 'student', '2025-12-06 04:33:59'),
(3, 'test', 'student2@gmail.com', '$2b$10$29uI0gQOSFKHK3/eFcSMdusrrf2dotASxs4Rih3Ppi8AkFyMrZGTu', 'student', '2025-12-07 10:05:45'),
(4, 'test', 'student3@gmail.com', '$2b$10$ylcF152y.VQUVV7mjFEsAO5qiE9iLbDfJxCvEhkstg/IWxIYG4nme', 'student', '2025-12-07 10:06:17');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_id` (`quiz_id`);

--
-- Index pour la table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Index pour la table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_id` (`quiz_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Index pour la table `student_answers`
--
ALTER TABLE `student_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attempt_id` (`attempt_id`),
  ADD KEY `question_id` (`question_id`);

--
-- Index pour la table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT pour la table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT pour la table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `student_answers`
--
ALTER TABLE `student_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT pour la table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quizzes_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `student_answers`
--
ALTER TABLE `student_answers`
  ADD CONSTRAINT `student_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
