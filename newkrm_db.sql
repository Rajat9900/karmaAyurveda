-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 03, 2026 at 03:22 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `newkrm_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `password_hash`, `created_at`) VALUES
(1, 'admin', '7f2a3383af254e210a4c8332d4b838e3eee58cd0ee3a88362e7d79a38c33ad5180787a30d1ff1cdcc090ea3b4fb3a11508632ea8d1d8b79329461d06b4c1ccfd', '2026-07-28 13:39:15');

-- --------------------------------------------------------

--
-- Table structure for table `awards`
--

CREATE TABLE `awards` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `date` varchar(100) NOT NULL,
  `sorting` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `awards`
--

INSERT INTO `awards` (`id`, `title`, `image`, `date`, `sorting`, `created_at`) VALUES
(1, 'Best Ayurvedic Hospital 2024', 'https://images.unsplash.com/photo-1579684389782-64d84b5e905d?auto=format&fit=crop&w=400&q=80', 'January 2024', 1, '2026-07-30 12:27:42'),
(2, 'Excellence in Renal Care & Research', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80', 'November 2023', 2, '2026-07-30 12:27:42'),
(3, 'Pioneer in Ayurvedic Therapeutics Award', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80', 'September 2023', 3, '2026-07-30 12:27:42');

-- --------------------------------------------------------

--
-- Table structure for table `blogs`
--

CREATE TABLE `blogs` (
  `id` int(11) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `excerpt` text NOT NULL,
  `content` text NOT NULL,
  `author` varchar(255) NOT NULL,
  `date` varchar(100) NOT NULL,
  `image` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `meta_des` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blogs`
--

INSERT INTO `blogs` (`id`, `slug`, `title`, `excerpt`, `content`, `author`, `date`, `image`, `category`, `created_at`, `meta_title`, `meta_keywords`, `meta_des`) VALUES
(1, 'understanding-ayurvedic-diet-for-kidney-health', 'Understanding the Ayurvedic Diet for Kidney Health', 'Discover the ancient secrets of Ayurveda to naturally detoxify your kidneys and improve overall renal health through mindful eating.', '\n      <p>Your diet plays a pivotal role in maintaining the health of your kidneys. According to Ayurveda, improper dietary habits (Apathya) lead to the accumulation of toxins (Ama), which slowly impair the kidney\'s filtration system.</p>\n      \n      <h3>The Role of Agni (Digestive Fire)</h3>\n      <p>In Ayurveda, a strong digestive fire (Agni) is essential. When Agni is weak, toxins build up in the body. For kidney patients, it is crucial to eat foods that are light, easy to digest, and pacifying to the Vata and Pitta doshas.</p>\n\n      <h3>Foods to Include</h3>\n      <ul>\n        <li><strong>Fresh Fruits:</strong> Apples, papayas, and berries are generally safe and rich in antioxidants.</li>\n        <li><strong>Vegetables:</strong> Bottle gourd (Lauki), pointed gourd (Parwal), and ridge gourd (Tori) are highly recommended.</li>\n        <li><strong>Grains:</strong> Quinoa, barley, and old rice are easy on the kidneys.</li>\n      </ul>\n\n      <h3>Foods to Avoid</h3>\n      <p>Processed foods, excessively salty foods, red meat, and heavy dairy products put an unnecessary burden on the kidneys and should be strictly avoided.</p>\n      \n      <p><em>Always consult with an Ayurvedic physician before making drastic changes to your diet, especially if you are dealing with Chronic Kidney Disease (CKD).</em></p>\n    ', 'Dr. Puneet Dhawan', 'October 12, 2023', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', 'Diet & Nutrition', '2026-07-28 13:39:15', 'Understanding the Ayurvedic Diet for Kidney Health', 'Diet & Nutrition, ayurveda, Dr. Puneet Dhawan', 'Discover the ancient secrets of Ayurveda to naturally detoxify your kidneys and improve overall renal health through mindful eating.'),
(2, 'panchakarma-therapy-for-detoxification', 'Panchakarma Therapy: The Ultimate Detox', 'Learn how Panchakarma therapy cleanses the body of deep-rooted toxins and helps rejuvenate the organs naturally.', '\n      <p>Panchakarma is the cornerstone of Ayurvedic detoxification. It consists of five (Pancha) actions (Karma) that eliminate toxic elements from the body.</p>\n      \n      <h3>Why is Detoxification Important?</h3>\n      <p>Over time, environmental pollutants, poor diet, and stress cause toxins to accumulate in the tissues. This accumulation is the root cause of many chronic diseases, including renal failure.</p>\n      \n      <h3>The Therapies</h3>\n      <ul>\n        <li><strong>Vamana:</strong> Therapeutic vomiting to remove excess Kapha.</li>\n        <li><strong>Virechana:</strong> Purgation therapy to eliminate Pitta toxins.</li>\n        <li><strong>Basti:</strong> Medicated enema, highly effective for Vata disorders and kidney health.</li>\n      </ul>\n      \n      <p>At Karma Ayurveda, we tailor Panchakarma treatments to the individual\'s constitution and specific health conditions, ensuring a safe and effective healing journey.</p>\n    ', 'Dr. Aarti Sharma', 'September 28, 2023', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80', 'Therapies', '2026-07-28 13:39:15', 'Panchakarma Therapy: The Ultimate Detox', 'Therapies, ayurveda, Dr. Aarti Sharma', 'Learn how Panchakarma therapy cleanses the body of deep-rooted toxins and helps rejuvenate the organs naturally.'),
(3, 'managing-creatinine-levels-naturally', 'How to Manage High Creatinine Levels Naturally', 'High creatinine is a common indicator of poor kidney function. Here are natural, Ayurvedic ways to manage and lower it.', '\n      <p>Creatinine is a waste product generated by muscle metabolism. Healthy kidneys filter it out, but when kidney function declines, creatinine levels rise.</p>\n      \n      <h3>Hydration is Key</h3>\n      <p>While fluid intake might need to be monitored in severe CKD, drinking adequate water is generally essential to help the kidneys flush out toxins.</p>\n\n      <h3>Herbal Remedies</h3>\n      <p>Ayurveda offers potent herbs like <strong>Punarnava</strong>, <strong>Gokshura</strong>, and <strong>Varuna</strong>, which have diuretic properties and help rejuvenate renal tissues.</p>\n\n      <h3>Lifestyle Modifications</h3>\n      <ul>\n        <li>Avoid intense, strenuous exercise which can increase creatinine production.</li>\n        <li>Manage stress through Yoga and Pranayama.</li>\n        <li>Ensure adequate sleep.</li>\n      </ul>\n    ', 'Dr. Puneet Dhawan', 'November 05, 2023', 'https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?auto=format&fit=crop&w=800&q=80', 'Kidney Health', '2026-07-28 13:39:15', 'How to Manage High Creatinine Levels Naturally', 'Kidney Health, ayurveda, Dr. Puneet Dhawan', 'High creatinine is a common indicator of poor kidney function. Here are natural, Ayurvedic ways to manage and lower it.'),
(4, 'yoga-poses-for-healthy-kidneys', '5 Yoga Poses for Healthy Kidneys', 'Incorporate these simple yet effective yoga asanas into your daily routine to stimulate kidney function and reduce stress.', '\n      <p>Yoga is a holistic practice that benefits both the mind and body. Certain asanas specifically target the abdominal region, stimulating the kidneys and improving blood circulation.</p>\n      \n      <h3>Top Asanas for Renal Health</h3>\n      <ol>\n        <li><strong>Bhujangasana (Cobra Pose):</strong> Stretches the abdomen and stimulates the abdominal organs.</li>\n        <li><strong>Paschimottanasana (Seated Forward Bend):</strong> Compresses the abdominal area, giving a massage-like effect to the kidneys.</li>\n        <li><strong>Ardha Matsyendrasana (Half Lord of the Fishes Pose):</strong> A twisting pose that helps detoxify the internal organs.</li>\n      </ol>\n      \n      <p>Always practice yoga under the guidance of a certified instructor, especially if you have pre-existing health conditions.</p>\n    ', 'Dr. Aarti Sharma', 'August 18, 2023', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', 'Lifestyle', '2026-07-28 13:39:15', '5 Yoga Poses for Healthy Kidneys', 'Lifestyle, ayurveda, Dr. Aarti Sharma', 'Incorporate these simple yet effective yoga asanas into your daily routine to stimulate kidney function and reduce stress.'),
(5, 'quill-editor-test', 'Quill Editor Test', 'Testing Quill rich text integration.', '<p><br></p><p>This is a test of the QuillJS rich text editor for Karma Ayurveda.</p>', 'Dr. Puneet DhawanDr. Puneet Dhawan', 'Jul 29, 2026', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', 'Kidney HealthDiet & Nutrition', '2026-07-29 07:51:02', 'Quill Editor Test', 'Kidney HealthDiet & Nutrition, ayurveda, Dr. Puneet DhawanDr. Puneet Dhawan', 'Testing Quill rich text integration.'),
(6, 'image-upload-test-2', 'Image Upload Test 2', 'Testing local featured image file uploading using test hook.', '<p>This is a test of the blog editor test hook.</p>', 'Dr. Puneet Dhawan', 'Jul 29, 2026', '/upload/blog/mock-image.png', 'Lifestyle', '2026-07-29 08:56:45', 'Image Upload Test 2', 'Lifestyle, ayurveda, Dr. Puneet Dhawan', 'Testing local featured image file uploading using test hook.');

-- --------------------------------------------------------

--
-- Table structure for table `blog_categories`
--

CREATE TABLE `blog_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blog_categories`
--

INSERT INTO `blog_categories` (`id`, `name`, `slug`, `created_at`) VALUES
(1, 'Kidney Health', 'kidney-health', '2026-07-30 07:10:10'),
(2, 'Diet & Nutrition', 'diet-nutrition', '2026-07-30 07:10:10'),
(3, 'Therapies', 'therapies', '2026-07-30 07:10:10'),
(4, 'Lifestyle', 'lifestyle', '2026-07-30 07:10:10'),
(5, 'Success Stories', 'success-stories', '2026-07-30 07:10:10');

-- --------------------------------------------------------

--
-- Table structure for table `blog_post_tags`
--

CREATE TABLE `blog_post_tags` (
  `blog_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_tags`
--

CREATE TABLE `blog_tags` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blog_tags`
--

INSERT INTO `blog_tags` (`id`, `name`, `slug`, `created_at`) VALUES
(1, 'Ayurveda', 'ayurveda', '2026-07-30 07:30:55'),
(2, 'Detox', 'detox', '2026-07-30 07:30:55'),
(3, 'Dialysis', 'dialysis', '2026-07-30 07:30:55'),
(4, 'Yoga', 'yoga', '2026-07-30 07:30:55'),
(5, 'Herbs', 'herbs', '2026-07-30 07:30:55'),
(6, 'Creatinine', 'creatinine', '2026-07-30 07:30:55'),
(7, 'Panchakarma', 'panchakarma', '2026-07-30 07:30:55');

-- --------------------------------------------------------

--
-- Table structure for table `cancer_clinics`
--

CREATE TABLE `cancer_clinics` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `map_url` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `disease_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cancer_clinics`
--

INSERT INTO `cancer_clinics` (`id`, `name`, `slug`, `address`, `city`, `phone`, `email`, `map_url`, `image`, `disease_id`, `created_at`) VALUES
(1, 'Karma Ayurveda Delhi Cancer Care', 'delhi-cancer-care', 'Building No. 12, Sector 8, Rohini', 'Delhi', '+91 99999 77777', 'delhi.cancer@karmaayurveda.com', 'https://maps.google.com', 'https://images.unsplash.com/photo-1579684389782-64d84b5e905d?auto=format&fit=crop&w=800&q=80', 8, '2026-07-30 10:46:35'),
(2, 'Karma Ayurveda Mumbai Cancer Care', 'mumbai-cancer-care', 'Andheri West, SV Road', 'Mumbai', '+91 88888 77777', 'mumbai.cancer@karmaayurveda.com', 'https://maps.google.com', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80', 8, '2026-07-30 10:46:35');

-- --------------------------------------------------------

--
-- Table structure for table `cancer_clinic_tags`
--

CREATE TABLE `cancer_clinic_tags` (
  `cancer_clinic_id` int(11) NOT NULL,
  `cancer_tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cancer_clinic_tags`
--

INSERT INTO `cancer_clinic_tags` (`cancer_clinic_id`, `cancer_tag_id`) VALUES
(1, 1),
(1, 3),
(2, 2),
(2, 4);

-- --------------------------------------------------------

--
-- Table structure for table `cancer_tags`
--

CREATE TABLE `cancer_tags` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cancer_tags`
--

INSERT INTO `cancer_tags` (`id`, `name`, `slug`, `created_at`) VALUES
(1, 'Immunotherapy', 'immunotherapy', '2026-07-30 10:46:35'),
(2, 'Chemotherapy Rehab', 'chemotherapy-rehab', '2026-07-30 10:46:35'),
(3, 'Palliative Care', 'palliative-care', '2026-07-30 10:46:35'),
(4, 'Targeted Therapy Support', 'targeted-therapy-support', '2026-07-30 10:46:35');

-- --------------------------------------------------------

--
-- Table structure for table `clinics`
--

CREATE TABLE `clinics` (
  `id` int(11) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `map_url` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clinics`
--

INSERT INTO `clinics` (`id`, `slug`, `name`, `address`, `city`, `phone`, `email`, `map_url`, `image`, `created_at`) VALUES
(1, 'delhi-clinic', 'Karma Ayurveda Delhi Clinic', '77, 2nd Floor, West Azad Nagar, Delhi - 110051', 'Delhi', '+91-9871927192', 'delhi@karmaayurveda.com', 'https://maps.google.com/?q=Karma+Ayurveda+Delhi', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80', '2026-07-29 09:22:46'),
(2, 'mumbai-clinic', 'Karma Ayurveda Mumbai Clinic', 'Shop No. 5, Ground Floor, Royal Palms, Aarey Milk Colony, Goregaon East, Mumbai - 400065', 'Mumbai', '+91-9871927192', 'mumbai@karmaayurveda.com', 'https://maps.google.com/?q=Karma+Ayurveda+Mumbai', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80', '2026-07-29 09:22:46'),
(3, 'bengaluru-clinic', 'Karma Ayurveda Bengaluru Clinic', '12, 1st Cross, Indiranagar, Bengaluru - 560038', 'Bengaluru', '+91-9871927192', 'bengaluru@karmaayurveda.com', 'https://maps.google.com/?q=Karma+Ayurveda+Bengaluru', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80', '2026-07-29 09:22:46'),
(4, 'jaipur-clinic', 'Karma Ayurveda Jaipur Clinic', 'Plot No. 12, Vaishali Nagar, Jaipur, Rajasthan - 302021', 'Jaipur', '+91-9971928080', 'jaipur@karmaayurveda.com', 'https://maps.google.com/?q=Karma+Ayurveda+Jaipur', '/upload/clinic/mock-clinic.png', '2026-07-29 12:33:16');

-- --------------------------------------------------------

--
-- Table structure for table `diseases`
--

CREATE TABLE `diseases` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `icon` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) NOT NULL,
  `what_is_title` varchar(255) NOT NULL,
  `bullets` text NOT NULL,
  `main_image` varchar(255) NOT NULL,
  `treatment_focus` text NOT NULL,
  `testimonials` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `meta_des` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diseases`
--

INSERT INTO `diseases` (`id`, `name`, `slug`, `icon`, `description`, `title`, `subtitle`, `what_is_title`, `bullets`, `main_image`, `treatment_focus`, `testimonials`, `created_at`, `meta_title`, `meta_keywords`, `meta_des`) VALUES
(1, 'Kidney Disease', 'kidney', '🫘', 'Holistic treatments to revive damaged kidney filters and reduce the need for dialysis.', 'Kidney Disease Treatment', 'Comprehensive Ayurvedic Care to Rejuvenate Nephrons & Restrict Dialysis Need', 'What Is Kidney Disease?', '[\"Kidneys filter extra water and waste products out of your blood 24 hours a day.\",\"When kidney function declines, these toxic wastes start building up in the bloodstream.\",\"Early stage kidney damage often has no obvious symptoms, making it hard to detect.\",\"Ayurvedic care focuses on naturally rejuvenating nephrons to restore filtration capacity.\"]', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Creatinine Management\",\"desc\":\"Using Mutral (diuretic) herbs like Gokshur and Varun to lower urea & creatinine.\"},{\"title\":\"Nephron Rejuvenation\",\"desc\":\"Rasayana herbs like Punarnava to revive damaged kidney filtration units.\"},{\"title\":\"GFR Correction\",\"desc\":\"Ayurvedic formulations aimed at progressively improving the Glomerular Filtration Rate.\"},{\"title\":\"Strict Fluid Regimen\",\"desc\":\"Precision fluid guidelines combined with custom sodium-potassium charts.\"}]', '[{\"caption\":\"Kidney Failure\",\"patientName\":\"Harish Sharma\",\"comparisonImg\":\"https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"b1-TE2uzmos\",\"duration\":\"6:20\"},{\"caption\":\"Chronic Kidney Disease\",\"patientName\":\"Asha Devi\",\"comparisonImg\":\"https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"IdSQ2EcJnxE\",\"duration\":\"4:45\"}]', '2026-07-30 08:37:00', 'Kidney Disease Treatment', 'Kidney Disease, treatment, ayurveda, healing', 'Holistic treatments to revive damaged kidney filters and reduce the need for dialysis.'),
(2, 'Chronic Kidney Care', 'chronic-kidney', '🫘', 'Holistic treatments to manage chronic kidney weakness and maintain health.', 'Chronic Kidney Disease Care', 'Comprehensive Ayurvedic Care for Chronic Kidney Conditions', 'What Is Chronic Kidney Disease?', '[\"Kidneys filter extra water and waste products out of your blood 24 hours a day.\",\"When kidney function declines, these toxic wastes start building up in the bloodstream.\",\"Early stage kidney damage often has no obvious symptoms, making it hard to detect.\",\"Ayurvedic care focuses on naturally rejuvenating nephrons to restore filtration capacity.\"]', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Creatinine Management\",\"desc\":\"Using Mutral (diuretic) herbs like Gokshur and Varun to lower urea & creatinine.\"},{\"title\":\"Nephron Rejuvenation\",\"desc\":\"Rasayana herbs like Punarnava to revive damaged kidney filtration units.\"},{\"title\":\"GFR Correction\",\"desc\":\"Ayurvedic formulations aimed at progressively improving the Glomerular Filtration Rate.\"},{\"title\":\"Strict Fluid Regimen\",\"desc\":\"Precision fluid guidelines combined with custom sodium-potassium charts.\"}]', '[{\"caption\":\"Kidney Failure\",\"patientName\":\"Harish Sharma\",\"comparisonImg\":\"https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"b1-TE2uzmos\",\"duration\":\"6:20\"},{\"caption\":\"Chronic Kidney Disease\",\"patientName\":\"Asha Devi\",\"comparisonImg\":\"https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"IdSQ2EcJnxE\",\"duration\":\"4:45\"}]', '2026-07-30 08:37:00', 'Chronic Kidney Care Treatment', 'Chronic Kidney Care, treatment, ayurveda, healing', 'Holistic treatments to manage chronic kidney weakness and maintain health.'),
(3, 'Chronic Kidney Disease', 'chronic-kidney-disease', '🫘', 'Holistic Ayurveda Management of Glomerular Filtration & Creatinine.', 'Chronic Kidney Disease (CKD) Treatment', 'Holistic Ayurveda Management of Glomerular Filtration & Creatinine', 'What Is Chronic Kidney Disease?', '[\"Kidneys filter extra water and waste products out of your blood 24 hours a day.\",\"When kidney function declines, these toxic wastes start building up in the bloodstream.\",\"Early stage kidney damage often has no obvious symptoms, making it hard to detect.\",\"Ayurvedic care focuses on naturally rejuvenating nephrons to restore filtration capacity.\"]', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Creatinine Management\",\"desc\":\"Using Mutral (diuretic) herbs like Gokshur and Varun to lower urea & creatinine.\"},{\"title\":\"Nephron Rejuvenation\",\"desc\":\"Rasayana herbs like Punarnava to revive damaged kidney filtration units.\"},{\"title\":\"GFR Correction\",\"desc\":\"Ayurvedic formulations aimed at progressively improving the Glomerular Filtration Rate.\"},{\"title\":\"Strict Fluid Regimen\",\"desc\":\"Precision fluid guidelines combined with custom sodium-potassium charts.\"}]', '[{\"caption\":\"Kidney Failure\",\"patientName\":\"Harish Sharma\",\"comparisonImg\":\"https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"b1-TE2uzmos\",\"duration\":\"6:20\"},{\"caption\":\"Chronic Kidney Disease\",\"patientName\":\"Asha Devi\",\"comparisonImg\":\"https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"IdSQ2EcJnxE\",\"duration\":\"4:45\"}]', '2026-07-30 08:37:00', 'Chronic Kidney Disease Treatment', 'Chronic Kidney Disease, treatment, ayurveda, healing', 'Holistic Ayurveda Management of Glomerular Filtration & Creatinine.'),
(4, 'Nephrotic Syndrome', 'nephrotic-syndrome', '🫘', 'Natural Rejuvenation of Renal Membrane and Glomeruli Filters.', 'Nephrotic Syndrome Care', 'Natural Rejuvenation of Renal Membrane and Glomeruli Filters', 'What Is Nephrotic Syndrome?', '[\"Kidneys filter extra water and waste products out of your blood 24 hours a day.\",\"When kidney function declines, these toxic wastes start building up in the bloodstream.\",\"Early stage kidney damage often has no obvious symptoms, making it hard to detect.\",\"Ayurvedic care focuses on naturally rejuvenating nephrons to restore filtration capacity.\"]', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Creatinine Management\",\"desc\":\"Using Mutral (diuretic) herbs like Gokshur and Varun to lower urea & creatinine.\"},{\"title\":\"Nephron Rejuvenation\",\"desc\":\"Rasayana herbs like Punarnava to revive damaged kidney filtration units.\"},{\"title\":\"GFR Correction\",\"desc\":\"Ayurvedic formulations aimed at progressively improving the Glomerular Filtration Rate.\"},{\"title\":\"Strict Fluid Regimen\",\"desc\":\"Precision fluid guidelines combined with custom sodium-potassium charts.\"}]', '[{\"caption\":\"Kidney Failure\",\"patientName\":\"Harish Sharma\",\"comparisonImg\":\"https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"b1-TE2uzmos\",\"duration\":\"6:20\"},{\"caption\":\"Chronic Kidney Disease\",\"patientName\":\"Asha Devi\",\"comparisonImg\":\"https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"IdSQ2EcJnxE\",\"duration\":\"4:45\"}]', '2026-07-30 08:37:00', 'Nephrotic Syndrome Treatment', 'Nephrotic Syndrome, treatment, ayurveda, healing', 'Natural Rejuvenation of Renal Membrane and Glomeruli Filters.'),
(5, 'Polycystic Kidney Disease', 'polycystic-kidney-disease', '🫘', 'Ayurvedic Treatment for Cysts and Kidney Health Rejuvenation.', 'Polycystic Kidney Disease (PKD)', 'Ayurvedic Treatment for Cysts and Kidney Health Rejuvenation', 'What Is Polycystic Kidney Disease?', '[\"Kidneys filter extra water and waste products out of your blood 24 hours a day.\",\"When kidney function declines, these toxic wastes start building up in the bloodstream.\",\"Early stage kidney damage often has no obvious symptoms, making it hard to detect.\",\"Ayurvedic care focuses on naturally rejuvenating nephrons to restore filtration capacity.\"]', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Creatinine Management\",\"desc\":\"Using Mutral (diuretic) herbs like Gokshur and Varun to lower urea & creatinine.\"},{\"title\":\"Nephron Rejuvenation\",\"desc\":\"Rasayana herbs like Punarnava to revive damaged kidney filtration units.\"},{\"title\":\"GFR Correction\",\"desc\":\"Ayurvedic formulations aimed at progressively improving the Glomerular Filtration Rate.\"},{\"title\":\"Strict Fluid Regimen\",\"desc\":\"Precision fluid guidelines combined with custom sodium-potassium charts.\"}]', '[{\"caption\":\"Kidney Failure\",\"patientName\":\"Harish Sharma\",\"comparisonImg\":\"https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"b1-TE2uzmos\",\"duration\":\"6:20\"},{\"caption\":\"Chronic Kidney Disease\",\"patientName\":\"Asha Devi\",\"comparisonImg\":\"https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"IdSQ2EcJnxE\",\"duration\":\"4:45\"}]', '2026-07-30 08:37:00', 'Polycystic Kidney Disease Treatment', 'Polycystic Kidney Disease, treatment, ayurveda, healing', 'Ayurvedic Treatment for Cysts and Kidney Health Rejuvenation.'),
(6, 'Kidney Failure', 'kidney-failure', '🫘', 'Natural Ayurvedic Therapies to Manage Creatinine & Urea Without Dialysis.', 'Kidney Failure Treatment', 'Natural Ayurvedic Therapies to Manage Creatinine & Urea Without Dialysis', 'What Is Kidney Failure?', '[\"Kidneys filter extra water and waste products out of your blood 24 hours a day.\",\"When kidney function declines, these toxic wastes start building up in the bloodstream.\",\"Early stage kidney damage often has no obvious symptoms, making it hard to detect.\",\"Ayurvedic care focuses on naturally rejuvenating nephrons to restore filtration capacity.\"]', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Creatinine Management\",\"desc\":\"Using Mutral (diuretic) herbs like Gokshur and Varun to lower urea & creatinine.\"},{\"title\":\"Nephron Rejuvenation\",\"desc\":\"Rasayana herbs like Punarnava to revive damaged kidney filtration units.\"},{\"title\":\"GFR Correction\",\"desc\":\"Ayurvedic formulations aimed at progressively improving the Glomerular Filtration Rate.\"},{\"title\":\"Strict Fluid Regimen\",\"desc\":\"Precision fluid guidelines combined with custom sodium-potassium charts.\"}]', '[{\"caption\":\"Kidney Failure\",\"patientName\":\"Harish Sharma\",\"comparisonImg\":\"https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"b1-TE2uzmos\",\"duration\":\"6:20\"},{\"caption\":\"Chronic Kidney Disease\",\"patientName\":\"Asha Devi\",\"comparisonImg\":\"https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"IdSQ2EcJnxE\",\"duration\":\"4:45\"}]', '2026-07-30 08:37:00', 'Kidney Failure Treatment', 'Kidney Failure, treatment, ayurveda, healing', 'Natural Ayurvedic Therapies to Manage Creatinine & Urea Without Dialysis.'),
(7, 'Proteinuria', 'proteinuria', '🫘', 'Ayurvedic Rejuvenation to Restrict Protein Leakage and Restore Kidney Health.', 'Proteinuria Treatment', 'Ayurvedic Rejuvenation to Restrict Protein Leakage and Restore Kidney Health', 'What Is Proteinuria?', '[\"Kidneys filter extra water and waste products out of your blood 24 hours a day.\",\"When kidney function declines, these toxic wastes start building up in the bloodstream.\",\"Early stage kidney damage often has no obvious symptoms, making it hard to detect.\",\"Ayurvedic care focuses on naturally rejuvenating nephrons to restore filtration capacity.\"]', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Creatinine Management\",\"desc\":\"Using Mutral (diuretic) herbs like Gokshur and Varun to lower urea & creatinine.\"},{\"title\":\"Nephron Rejuvenation\",\"desc\":\"Rasayana herbs like Punarnava to revive damaged kidney filtration units.\"},{\"title\":\"GFR Correction\",\"desc\":\"Ayurvedic formulations aimed at progressively improving the Glomerular Filtration Rate.\"},{\"title\":\"Strict Fluid Regimen\",\"desc\":\"Precision fluid guidelines combined with custom sodium-potassium charts.\"}]', '[{\"caption\":\"Kidney Failure\",\"patientName\":\"Harish Sharma\",\"comparisonImg\":\"https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"b1-TE2uzmos\",\"duration\":\"6:20\"},{\"caption\":\"Chronic Kidney Disease\",\"patientName\":\"Asha Devi\",\"comparisonImg\":\"https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"IdSQ2EcJnxE\",\"duration\":\"4:45\"}]', '2026-07-30 08:37:00', 'Proteinuria Treatment', 'Proteinuria, treatment, ayurveda, healing', 'Ayurvedic Rejuvenation to Restrict Protein Leakage and Restore Kidney Health.'),
(8, 'Cancer', 'cancer', '🎗️', 'Supportive and integrative Ayurvedic care for cellular recovery and Dosha balance.', 'Ayurvedic Cancer Care', 'Supportive and Integrative Ayurvedic Care for Cellular Recovery & Dosha Balance', 'What Is Cancer?', '[\"Cancer is a life-threatening disease caused by the uncontrolled growth and spread of abnormal cells.\",\"Normally, body cells divide, grow, and die in a regular cycle.\",\"When this process is disturbed, cells begin to multiply uncontrollably.\",\"These abnormal cells gather in one area, forming cysts or tumors.\"]', 'https://images.unsplash.com/photo-1579684389782-64d84b5e905d?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Immunity Boosting\",\"desc\":\"Rasayana therapies to enhance natural defense and combat toxins (Ama).\"},{\"title\":\"Side-Effect Mitigation\",\"desc\":\"Easing the fatigue and physical strain of conventional treatments.\"},{\"title\":\"Dosha Harmonization\",\"desc\":\"Targeted herbal formulas to calm highly aggravated Vata and Pitta.\"},{\"title\":\"Cellular Restoration\",\"desc\":\"Herbs like Tulsi, Ashwagandha, and Turmeric to support cellular repair.\"}]', '[{\"caption\":\"Mouth Cancer\",\"patientName\":\"Rajesh Kumar\",\"comparisonImg\":\"/images/mouth_cancer_before_after.png\",\"videoId\":\"igRAgRP9KvM\",\"duration\":\"4:15\"},{\"caption\":\"Blood Cancer\",\"patientName\":\"Meena Sharma\",\"comparisonImg\":\"/images/blood_cancer_before_after.png\",\"videoId\":\"b1-TE2uzmos\",\"duration\":\"5:20\"}]', '2026-07-30 08:37:00', 'Cancer Treatment', 'Cancer, treatment, ayurveda, healing', 'Supportive and integrative Ayurvedic care for cellular recovery and Dosha balance.'),
(9, 'Liver Care', 'liver', '🍷', 'Natural rejuvenation and detoxification to restore metabolic liver health.', 'Liver Cirrhosis & Fatty Liver Care', 'Natural Ayurvedic Detoxification & Cellular Rejuvenation for Liver Pathologies', 'What Is Liver Disease?', '[\"The liver processes everything you eat and drink, filtering out harmful toxins.\",\"Fat accumulation or chronic inflammation can damage liver tissues over time.\",\"Damaged liver cells are replaced by scar tissue, leading to liver cirrhosis.\",\"Natural therapies help detoxify liver cells and restore healthy metabolic enzyme levels.\"]', 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Bile Regulation\",\"desc\":\"Balancing Ranjaka Pitta to optimize liver secretions and enzyme profiles.\"},{\"title\":\"Hepatocyte Protection\",\"desc\":\"Using Katuki and Bhumi Amla to reduce liver inflammation & scarring.\"},{\"title\":\"Toxin Flush (Ama)\",\"desc\":\"Gentle colon cleanses and herbal combinations to flush out stored liver toxins.\"},{\"title\":\"Metabolism Boost\",\"desc\":\"Strengthening the digestive fire (Jatharagni) to prevent future fatty deposits.\"}]', '[{\"caption\":\"Liver Cirrhosis\",\"patientName\":\"Amit Patel\",\"comparisonImg\":\"https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"IdSQ2EcJnxE\",\"duration\":\"5:10\"},{\"caption\":\"Fatty Liver Reversal\",\"patientName\":\"Vikram Malhotra\",\"comparisonImg\":\"https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"igRAgRP9KvM\",\"duration\":\"3:40\"}]', '2026-07-30 08:37:00', 'Liver Care Treatment', 'Liver Care, treatment, ayurveda, healing', 'Natural rejuvenation and detoxification to restore metabolic liver health.'),
(10, 'Psoriasis', 'psoriasis', '🌿', 'Root-cause healing and blood purification therapies for psoriasis, eczema, and skin scaling.', 'Psoriasis & Skin Treatment', 'Holistic Blood Purification and Dosha Management for Lasting Skin Health', 'What Is Psoriasis?', '[\"Psoriasis is a chronic skin disorder that causes cells to build up rapidly on the skin\'s surface.\",\"This rapid growth leads to thick, red, scaly patches that can itch or feel painful.\",\"In Ayurveda, skin issues are treated by purifying the blood (Rakta Shodhana) and balancing doshas.\",\"Addressing the root cause helps soothe inflammation and keep skin clear long-term.\"]', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Blood Detox (Rakta)\",\"desc\":\"Blood-purifying herbs like Neem, Manjistha, and Khadir to soothe skin scaling.\"},{\"title\":\"Vata-Kapha Pacification\",\"desc\":\"Balancing the specific doshas responsible for dryness, itching, and plaque formation.\"},{\"title\":\"Soothing Topical Oils\",\"desc\":\"Psoria-protective Ayurvedic medicated oils to moisturize and restore skin layers.\"},{\"title\":\"Gut-Skin Axis Balance\",\"desc\":\"Improving digestional absorption to stop the accumulation of skin-damaging toxins (Visha).\"}]', '[{\"caption\":\"Plaque Psoriasis Reversal\",\"patientName\":\"Sanjay Verma\",\"comparisonImg\":\"https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"igRAgRP9KvM\",\"duration\":\"4:05\"},{\"caption\":\"Scalp Psoriasis Recovery\",\"patientName\":\"Rekha Joshi\",\"comparisonImg\":\"https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"b1-TE2uzmos\",\"duration\":\"3:50\"}]', '2026-07-30 08:37:00', 'Psoriasis Treatment', 'Psoriasis, treatment, ayurveda, healing', 'Root-cause healing and blood purification therapies for psoriasis, eczema, and skin scaling.'),
(11, 'Parkinson\'s Care', 'parkinson', '🧠', 'Vata pacifying and neuro-protective Ayurvedic therapies for balance and movement strength.', 'Parkinson\'s & Neurological Care', 'Vata Pacifying and Neuro-Protective Ayurvedic Therapies for Balance & Strength', 'What Is Parkinson\'s?', '[\"Parkinson\'s is a progressive nervous system disorder that primarily affects physical movement.\",\"It develops due to the gradual breakdown and loss of dopamine-producing brain cells.\",\"Common signs include hand tremors, limb stiffness, and slow physical movement.\",\"Ayurvedic neuro-protective therapies focus on pacifying Vata dosha to support nerve health.\"]', 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Vata Control (Kampa Vata)\",\"desc\":\"Warm, grounding therapies and herbal oils to calm the nervous system (Majja Dhatu).\"},{\"title\":\"Natural L-Dopa Herbs\",\"desc\":\"Utilizing Kapikachhu and Ashwagandha to naturally feed and protect neural pathways.\"},{\"title\":\"Panchakarma (Basti/Nasya)\",\"desc\":\"Specialized cleansing enemas and nasal drops to ground hyperactive neural energies.\"},{\"title\":\"Balance Restoration\",\"desc\":\"Gentle motor exercises and customized herbal powders to regain coordination.\"}]', '[{\"caption\":\"Tremor Management\",\"patientName\":\"Gopal Prasad\",\"comparisonImg\":\"https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"IdSQ2EcJnxE\",\"duration\":\"5:30\"},{\"caption\":\"Mobility Support\",\"patientName\":\"Sushma Swaraj\",\"comparisonImg\":\"https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"igRAgRP9KvM\",\"duration\":\"4:20\"}]', '2026-07-30 08:37:00', 'Parkinson\'s Care Treatment', 'Parkinson\'s Care, treatment, ayurveda, healing', 'Vata pacifying and neuro-protective Ayurvedic therapies for balance and movement strength.'),
(12, 'Diabetes', 'diabetes', '🩸', 'Holistic approaches combining diet, lifestyle, and Ayurvedic medicines for blood sugar management.', 'Diabetes Reversal & Management', 'Correcting Liver & Pancreatic Metabolism (Agni) to Restore Insulin Sensitivity', 'What Is Diabetes?', '[\"Diabetes is a metabolic condition that affects how your body turns food into energy.\",\"Insulin resistance prevents cells from absorbing glucose, leading to high blood sugar.\",\"Uncontrolled diabetes can damage blood vessels, nerves, kidneys, and other vital organs.\",\"Holistic Ayurvedic care targets metabolic correction to restore natural insulin sensitivity.\"]', 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Pancreatic Health\",\"desc\":\"Bitter herbs like Gudmar, Karela, and Methi to trigger beta-cell secretions.\"},{\"title\":\"Digestive Correction\",\"desc\":\"Strengthening the metabolic fire to digest excess sugar and prevent toxin (Ama) accumulation.\"},{\"title\":\"Neuropathy Defense\",\"desc\":\"Nerve-strengthening Rasayana blends to avoid diabetic complications.\"},{\"title\":\"Ayurvedic Diet Chart\",\"desc\":\"Strict customized carbohydrate limits combined with detoxifying raw fiber plans.\"}]', '[{\"caption\":\"Blood Sugar Reversal\",\"patientName\":\"Vijay Yadav\",\"comparisonImg\":\"https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"b1-TE2uzmos\",\"duration\":\"4:50\"},{\"caption\":\"Insulin-Free Life\",\"patientName\":\"Sunita Gupta\",\"comparisonImg\":\"https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"IdSQ2EcJnxE\",\"duration\":\"5:05\"}]', '2026-07-30 08:37:00', 'Diabetes Treatment', 'Diabetes, treatment, ayurveda, healing', 'Holistic approaches combining diet, lifestyle, and Ayurvedic medicines for blood sugar management.'),
(13, 'Arthritis', 'arthritis', '🦴', 'Ayurvedic treatments for joint pain, inflammation, and stiffness using herbal formulations and therapies.', 'Arthritis & Joint Care', 'Grounding Excess Vata and Flushing Gut Toxins (Ama) from Joint Cavities', 'What Is Arthritis?', '[\"Arthritis is a common disorder causing painful inflammation and stiffness in joints.\",\"It can occur due to cartilage wear-and-tear or auto-immune response (Rheumatoid).\",\"Toxins (Ama) accumulating in the joints can worsen inflammation and reduce flexibility.\",\"Warm herbal oil therapies and lifestyle management help soothe joints and restore mobility.\"]', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Ama Digestives (Deepan-Pachan)\",\"desc\":\"Using spices and herbs like Guggulu and Ginger to dissolve gut toxins before they travel to joints.\"},{\"title\":\"Vata Pacifying Massages\",\"desc\":\"Snehana (warm oil lubrication) with specialized oils like Mahanarayan Taila.\"},{\"title\":\"Anti-Inflammatory Herbs\",\"desc\":\"Shallaki, Ashwagandha, and Turmeric to soothe joint swelling and restore ease of movement.\"},{\"title\":\"Gentle Joint Sukshma Vyayama\",\"desc\":\"Micro-movements and guided postures to retain cartilage spacing and avoid stiffness.\"}]', '[{\"caption\":\"Rheumatoid Arthritis Care\",\"patientName\":\"Kailash Chand\",\"comparisonImg\":\"https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"IdSQ2EcJnxE\",\"duration\":\"6:10\"},{\"caption\":\"Osteoarthritis Mobility\",\"patientName\":\"Kamlesh Devi\",\"comparisonImg\":\"https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"igRAgRP9KvM\",\"duration\":\"4:30\"}]', '2026-07-30 08:37:00', 'Arthritis Treatment', 'Arthritis, treatment, ayurveda, healing', 'Ayurvedic treatments for joint pain, inflammation, and stiffness using herbal formulations and therapies.'),
(14, 'Asthma', 'asthma', '🫁', 'Natural remedies to strengthen the respiratory system and manage breathing difficulties.', 'Asthma & Respiratory Care', 'Clearing Kapha Congestion and Rebuilding Lung Tissue Immunity Naturally', 'What Is Asthma?', '[\"Asthma is a chronic condition that inflames and narrows the lungs\' airways.\",\"This narrowing causes periods of wheezing, chest tightness, and shortness of breath.\",\"Allergens, pollution, and Kapha dosha congestion in the chest are common triggers.\",\"Treatments aim to clear respiratory pathways, reduce airway sensitivity, and boost immunity.\"]', 'https://images.unsplash.com/photo-1628863012283-7472be757cef?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Bronchodilation\",\"desc\":\"Using Vasaka (Adhatoda vasica) and Pippali to relax air passages and thin Kapha mucus.\"},{\"title\":\"Pranavaha Srotas Cleansing\",\"desc\":\"Ayurvedic herbs and hot steam therapy to decongest bronchioles and alleviate cough.\"},{\"title\":\"Immunity Rebuilding\",\"desc\":\"Strengthening lung tissues using Rasayanas like Chitrabhadi and Haridrakhanda.\"},{\"title\":\"Pranayama Guidance\",\"desc\":\"Targeted breathing protocols to expand overall tidal capacity and lung durability.\"}]', '[{\"caption\":\"Inhaler-Free Life\",\"patientName\":\"Rajeev Saxena\",\"comparisonImg\":\"https://images.unsplash.com/photo-1628863012283-7472be757cef?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"igRAgRP9KvM\",\"duration\":\"4:00\"},{\"caption\":\"Allergic Asthma Control\",\"patientName\":\"Anjali Mehta\",\"comparisonImg\":\"https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"b1-TE2uzmos\",\"duration\":\"5:12\"}]', '2026-07-30 08:37:00', 'Asthma Treatment', 'Asthma, treatment, ayurveda, healing', 'Natural remedies to strengthen the respiratory system and manage breathing difficulties.'),
(15, 'Skin Diseases', 'skin-diseases', '🌿', 'Effective treatments for psoriasis, eczema, acne, and other skin conditions through blood purification.', 'Skin Diseases Treatment', 'Effective Ayurvedic Therapies for Eczema, Acne, and Psoriasis', 'What Are Skin Diseases?', '[\"Skin disorders range from mild allergies and acne to chronic conditions like psoriasis or eczema.\",\"Ayurveda views skin issues as an imbalance in Rakta (blood) and Pitta dosha.\",\"Detoxification helps clear deep-seated toxins causing skin irritations.\",\"Targeted herbal applications soothe the external layers while restoring skin health from within.\"]', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Blood Cleansing\",\"desc\":\"Using Neem and Khadir to purify blood channels and calm scaling.\"},{\"title\":\"Inflammation Relief\",\"desc\":\"Topical soothing pastes and cold-pressed coconut-herb formulations.\"}]', '[{\"caption\":\"Skin Recovery\",\"patientName\":\"Sanjay Verma\",\"comparisonImg\":\"https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"igRAgRP9KvM\",\"duration\":\"4:05\"}]', '2026-07-30 08:37:00', 'Skin Diseases Treatment', 'Skin Diseases, treatment, ayurveda, healing', 'Effective treatments for psoriasis, eczema, acne, and other skin conditions through blood purification.'),
(16, 'Digestive Disorders', 'digestive-disorders', '🔥', 'Solutions for acidity, IBS, constipation, and indigestion by balancing the digestive fire (Agni).', 'Digestive Disorders & IBS Care', 'Reviving Digestive Fire (Agni) to Eliminate Indigestion, IBS, and Acidity', 'What Are Digestive Disorders?', '[\"Poor eating habits or high stress levels weaken the digestive fire (Agni).\",\"This leads to partially digested food turning into sticky toxins (Ama) in the gut.\",\"Common symptoms include bloating, gas, chronic acidity, constipation, or IBS.\",\"Ayurvedic therapies focus on deepan-pachan (appetizing-digesting) and cleansing channels.\"]', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Agni Correction\",\"desc\":\"Prescribing digestive stimulants like Hingwashtak Churna and Ginger.\"},{\"title\":\"Ama Cleansing\",\"desc\":\"Panchakarma therapies like Virechana to clean the gastrointestinal tract.\"}]', '[{\"caption\":\"IBS Management\",\"patientName\":\"Vijay Yadav\",\"comparisonImg\":\"https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"b1-TE2uzmos\",\"duration\":\"4:50\"}]', '2026-07-30 08:37:00', 'Digestive Disorders Treatment', 'Digestive Disorders, treatment, ayurveda, healing', 'Solutions for acidity, IBS, constipation, and indigestion by balancing the digestive fire (Agni).'),
(17, 'Migraine', 'migraine', '🧠', 'Root-cause treatment for chronic headaches and migraines through therapies like Shirodhara and Nasya.', 'Migraine & Chronic Headache Care', 'Ayurvedic Treatment for Migraines and Neurological Headaches', 'What Is Migraine?', '[\"Migraine is characterized by intense throbbing pain, usually on one side of the head.\",\"It is often accompanied by nausea, vomiting, and extreme sensitivity to light/sound.\",\"Ayurveda identifies high Pitta and Vata imbalances as the primary trigger.\",\"Calming therapies directly reduce nervous stress and relieve chronic pain.\"]', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Nasal Therapy (Nasya)\",\"desc\":\"Administering medicated ghee drops in nasal passages to soothe head channels.\"},{\"title\":\"Shirodhara\",\"desc\":\"Pouring warm herbal oils onto the forehead to relax the nervous system.\"}]', '[{\"caption\":\"Migraine Reversal\",\"patientName\":\"Rekha Joshi\",\"comparisonImg\":\"https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"igRAgRP9KvM\",\"duration\":\"3:50\"}]', '2026-07-30 08:37:00', 'Migraine Treatment', 'Migraine, treatment, ayurveda, healing', 'Root-cause treatment for chronic headaches and migraines through therapies like Shirodhara and Nasya.'),
(18, 'PCOD / PCOS', 'pcod-pcos', '🌸', 'Ayurvedic management of hormonal imbalances through personalized diet, lifestyle, and herbal medicines.', 'PCOD & PCOS Treatment', 'Correcting Hormonal Imbalances and Ovarian Metabolism Naturally', 'What Is PCOD/PCOS?', '[\"PCOS is a hormonal disorder causing enlarged ovaries with small cysts on the outer edges.\",\"Symptoms include irregular periods, excess facial hair, weight gain, and acne.\",\"Ayurveda views PCOS as a Kapha-Artava system congestion and low metabolism.\",\"Hormonal balance is restored using cleansing therapies and specific endocrine-supporting herbs.\"]', 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Ovarian Balance\",\"desc\":\"Using herbs like Shatavari, Kanchanar Guggulu, and Aloe Vera to reduce cyst size.\"},{\"title\":\"Metabolism Boost\",\"desc\":\"Diet modifications combined with fat-burning exercises to correct insulin sensitivity.\"}]', '[{\"caption\":\"PCOS Recovery\",\"patientName\":\"Sunita Gupta\",\"comparisonImg\":\"https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"IdSQ2EcJnxE\",\"duration\":\"5:05\"}]', '2026-07-30 08:37:00', 'PCOD / PCOS Treatment', 'PCOD / PCOS, treatment, ayurveda, healing', 'Ayurvedic management of hormonal imbalances through personalized diet, lifestyle, and herbal medicines.'),
(19, 'Obesity', 'obesity', '⚖️', 'Weight management programs focusing on metabolism correction and detoxification.', 'Ayurvedic Obesity Management', 'Correcting Fat Metabolism (Medo Dhatu) to Achieve Sustainable Weight Loss', 'What Is Obesity?', '[\"Obesity is a complex disease involving an excessive amount of body fat.\",\"In Ayurveda, it is termed Sthaulya, caused by slow metabolism and blocked fat channels.\",\"A sluggish digestive fire leads to tissue buildup instead of energy generation.\",\"Detoxification and deep tissue stimulation help kickstart meda (fat) metabolism.\"]', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', '[{\"title\":\"Dry Powder Massage (Udvartana)\",\"desc\":\"Using herbal powders to break down subcutaneous fat tissues.\"},{\"title\":\"Meda Cleansing\",\"desc\":\"Herbs like Guggulu and Triphala to clear fat channels and optimize lipid profiles.\"}]', '[{\"caption\":\"Weight Loss Reversal\",\"patientName\":\"Vikram Malhotra\",\"comparisonImg\":\"https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80\",\"videoId\":\"igRAgRP9KvM\",\"duration\":\"3:40\"}]', '2026-07-30 08:37:00', 'Obesity Treatment', 'Obesity, treatment, ayurveda, healing', 'Weight management programs focusing on metabolism correction and detoxification.');

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `education` varchar(255) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `detail` text NOT NULL,
  `image` varchar(255) NOT NULL,
  `clinic_id` int(11) DEFAULT NULL,
  `is_owner` tinyint(4) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `name`, `education`, `designation`, `detail`, `image`, `clinic_id`, `is_owner`, `created_at`) VALUES
(1, 'Dr. Puneet Dhawan', 'BAMS', 'Principal Ayurvedic Kidney Specialist', 'A 5th-generation Ayurvedic physician, Dr. Puneet has transformed the lives of over 1.5 lakh kidney patients globally. With a deep rooted belief in ancient Ayurvedic science, he has successfully proven that kidney failure can be reversed naturally, without the need for painful dialysis or transplants.', 'https://www.karmaayurveda.com/new/assets/image/dr-puneet.png', 3, 1, '2026-07-30 09:33:22'),
(2, 'Dr. Nikhil Diwakar Sharma', 'Ayurveda Doctor, BAMS', 'Ayurveda Physician & Meditative Healer', 'Dr. Nikhil Diwakar Sharma is BAMS graduate from Kurukshetra University. He is an accomplished Ayurveda physician, speaker and meditative healer and has a vast experience of 12 years in curing various diseases like arthritis, skin diseases, kidney problems, liver disorders, etc.', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80', 3, 0, '2026-07-30 09:33:22'),
(3, 'Dr. Krutika Awasthi', 'Ayurveda Doctor, BAMS', 'Chronic Lifestyle Disease Specialist', 'Dr. Krutika Awasthi is BAMS Graduate from Ch. Brahm Prakash Ayurved Charak Sansthan, New Delhi. She is an accomplished Ayurveda physician, speaker, and healer. She has 3+ years of experience in treating various chronic lifestyle diseases especially kidney problems, heart, diabetes, blood pressure, skin diseases, female problems, arthritis, etc.', 'https://images.unsplash.com/photo-1594824432258-2eb75b067f92?auto=format&fit=crop&w=256&h=256&q=80', 3, 0, '2026-07-30 09:33:22'),
(4, 'Dr. Monika Yadav', 'BAMS, MBA(HM)', 'Senior Panchakarma Consultant', 'She completed her BAMS from Shri Krishna Govt. Ayurvedic College, Kurukshetra, Haryana. With 12+ years of experience in ancient Ayurveda and Panchakarma, she specializes in chronic progressive conditions like liver & kidney disorders, gynecological issues, skin disease, and arthritis, using classical medicines and lifestyle guidance.', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80', 3, 0, '2026-07-30 09:33:22'),
(5, 'Dr. Deepak K Jain', 'Ayurvedacharya (BAMS), Panchakarma Consultant', 'Classical Ayurveda Expert', 'He completed his BAMS from Govt. Ayurved College Gwalior (MP) and brings 20+ years of experience in classical Ayurveda and Panchakarma. He specializes in chronic progressive conditions like liver & kidney disorders, joint diseases, skin ailments, motor neuron disease, Parkinson\'s, and more.', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80', 3, 0, '2026-07-30 09:33:22');

-- --------------------------------------------------------

--
-- Table structure for table `knee_clinics`
--

CREATE TABLE `knee_clinics` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `map_url` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `disease_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `knee_clinics`
--

INSERT INTO `knee_clinics` (`id`, `name`, `slug`, `address`, `city`, `phone`, `email`, `map_url`, `image`, `disease_id`, `created_at`) VALUES
(1, 'Karma Ayurveda Delhi Knee Care', 'delhi-knee-care', 'H-3, Sector 14, Rohini', 'Delhi', '+91 99999 55555', 'delhi.knee@karmaayurveda.com', 'https://maps.google.com', 'https://images.unsplash.com/photo-1579684389782-64d84b5e905d?auto=format&fit=crop&w=800&q=80', 13, '2026-07-30 11:20:13'),
(2, 'Karma Ayurveda Mumbai Knee Care', 'mumbai-knee-care', 'Andheri West, SV Road', 'Mumbai', '+91 88888 55555', 'mumbai.knee@karmaayurveda.com', 'https://maps.google.com', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80', 13, '2026-07-30 11:20:13');

-- --------------------------------------------------------

--
-- Table structure for table `knee_clinic_tags`
--

CREATE TABLE `knee_clinic_tags` (
  `knee_clinic_id` int(11) NOT NULL,
  `knee_tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `knee_clinic_tags`
--

INSERT INTO `knee_clinic_tags` (`knee_clinic_id`, `knee_tag_id`) VALUES
(1, 1),
(1, 4),
(2, 2),
(2, 3);

-- --------------------------------------------------------

--
-- Table structure for table `knee_tags`
--

CREATE TABLE `knee_tags` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `knee_tags`
--

INSERT INTO `knee_tags` (`id`, `name`, `slug`, `created_at`) VALUES
(1, 'Osteoarthritis Rehab', 'osteoarthritis-rehab', '2026-07-30 11:20:13'),
(2, 'Joint Pain Therapy', 'joint-pain-therapy', '2026-07-30 11:20:13'),
(3, 'Therapeutic Massage', 'therapeutic-massage', '2026-07-30 11:20:13'),
(4, 'Janu Basti Specialist', 'janu-basti-specialist', '2026-07-30 11:20:13');

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `disease` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `media_articles`
--

CREATE TABLE `media_articles` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `article_link` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `sort` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `media_articles`
--

INSERT INTO `media_articles` (`id`, `title`, `article_link`, `image`, `sort`, `created_at`) VALUES
(1, 'Karma Ayurveda Recognized for Breakthrough in Kidney Care', 'https://timesofindia.indiatimes.com', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80', 1, '2026-07-31 10:09:59'),
(2, 'The Future of Ayurvedic Medicine: A Deep Dive with Dr. Dhawan', 'https://www.hindustantimes.com', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', 2, '2026-07-31 10:09:59');

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Terms & Conditions', 'terms-and-conditions', '<h1>Terms & Conditions</h1><p>Welcome to Karma Ayurveda. By accessing this website, you agree to comply with and be bound by these terms and conditions...</p>', '2026-07-31 10:24:46', '2026-07-31 10:24:46'),
(2, 'Privacy Policy', 'privacy-policy', '<h1>Privacy Policy</h1><p>Your privacy is extremely important to us. This policy describes how we collect, use, and protect your personal information...</p>', '2026-07-31 10:24:46', '2026-07-31 10:24:46'),
(3, 'Disclaimer', 'disclaimer', '<h1>Disclaimer</h1><p>The information on this site is not intended or implied to be a substitute for professional medical advice, diagnosis or treatment...</p>', '2026-07-31 10:24:46', '2026-07-31 10:24:46'),
(4, 'Cancellation & Refund', 'cancellation-refund', '<h1>Cancellation & Refund Policy</h1><p>Please read our policy regarding cancellation of appointments and refund processing conditions...</p>', '2026-07-31 10:24:46', '2026-07-31 10:24:46'),
(5, 'Return Policy', 'return-policy', '<h1>Return Policy</h1><p>Products ordered through our portal can be returned within the specified period if they meet the return criteria...</p>', '2026-07-31 10:24:46', '2026-07-31 10:24:46');

-- --------------------------------------------------------

--
-- Table structure for table `panchakarma_clinics`
--

CREATE TABLE `panchakarma_clinics` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `map_url` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `disease_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `panchakarma_clinics`
--

INSERT INTO `panchakarma_clinics` (`id`, `name`, `slug`, `address`, `city`, `phone`, `email`, `map_url`, `image`, `disease_id`, `created_at`) VALUES
(1, 'Karma Ayurveda Delhi Panchakarma Center', 'delhi-panchakarma', 'Pocket 24, Sector 24, Rohini', 'Delhi', '+91 99999 99999', 'delhi@karmaayurveda.com', 'https://maps.google.com', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80', 6, '2026-07-30 10:37:22'),
(2, 'Karma Ayurveda Mumbai Panchakarma Center', 'mumbai-panchakarma', 'Bandra West, Link Road', 'Mumbai', '+91 88888 88888', 'mumbai@karmaayurveda.com', 'https://maps.google.com', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80', 16, '2026-07-30 10:37:22');

-- --------------------------------------------------------

--
-- Table structure for table `panchakarma_clinic_tags`
--

CREATE TABLE `panchakarma_clinic_tags` (
  `panchakarma_clinic_id` int(11) NOT NULL,
  `panchakarma_tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `panchakarma_clinic_tags`
--

INSERT INTO `panchakarma_clinic_tags` (`panchakarma_clinic_id`, `panchakarma_tag_id`) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 3);

-- --------------------------------------------------------

--
-- Table structure for table `panchakarma_tags`
--

CREATE TABLE `panchakarma_tags` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `panchakarma_tags`
--

INSERT INTO `panchakarma_tags` (`id`, `name`, `slug`, `created_at`) VALUES
(1, 'Detoxification', 'detoxification', '2026-07-30 10:37:22'),
(2, 'Rejuvenation', 'rejuvenation', '2026-07-30 10:37:22'),
(3, 'Stress Relief', 'stress-relief', '2026-07-30 10:37:22');

-- --------------------------------------------------------

--
-- Table structure for table `site_faq`
--

CREATE TABLE `site_faq` (
  `id` int(11) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `sorting` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `site_faq`
--

INSERT INTO `site_faq` (`id`, `question`, `answer`, `sorting`, `created_at`) VALUES
(1, 'What is Ayurveda?', 'Ayurveda is a 5,000-year-old system of natural healing that has its origins in the Vedic culture of India. It focuses on balance, diet, herbal treatment, and yogic breathing.', 1, '2026-07-30 12:35:18'),
(2, 'How long does kidney treatment take in Ayurveda?', 'The duration of Ayurvedic kidney treatment depends on the severity of the disease and individual response to therapy. Generally, patients notice improvements within a few months of disciplined diet and medicines.', 2, '2026-07-30 12:35:18'),
(3, 'Are there any side effects of Ayurvedic medicines?', 'Ayurvedic medicines are formulated from natural herbs and minerals. When taken under the guidance of a qualified Ayurvedic practitioner, they are highly safe and free from toxic side effects.', 3, '2026-07-30 12:35:18');

-- --------------------------------------------------------

--
-- Table structure for table `site_profile`
--

CREATE TABLE `site_profile` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `logo` varchar(255) NOT NULL,
  `favicon` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `us_phone` varchar(50) NOT NULL,
  `address` text NOT NULL,
  `x_link` varchar(255) DEFAULT NULL,
  `fb_link` varchar(255) DEFAULT NULL,
  `ig_link` varchar(255) DEFAULT NULL,
  `yt_link` varchar(255) DEFAULT NULL,
  `wa_number` varchar(50) DEFAULT NULL,
  `wa_channel` varchar(255) DEFAULT NULL,
  `nabh_logo` varchar(255) DEFAULT NULL,
  `nabh_cert_num` varchar(100) DEFAULT NULL,
  `nabh_duration` varchar(100) DEFAULT NULL,
  `total_hospitals` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `site_profile`
--

INSERT INTO `site_profile` (`id`, `name`, `logo`, `favicon`, `email`, `phone`, `us_phone`, `address`, `x_link`, `fb_link`, `ig_link`, `yt_link`, `wa_number`, `wa_channel`, `nabh_logo`, `nabh_cert_num`, `nabh_duration`, `total_hospitals`, `created_at`, `updated_at`) VALUES
(1, 'Karma Ayurveda', 'https://www.karmaayurveda.com/new/assets/image/logo.png', '/favicon.ico', 'info@karmaayurveda.com', '+91 99999 99999', '+1 (800) 555-0199', 'Pocket 24, Sector 24, Rohini, New Delhi, Delhi 110085', 'https://x.com/karmaayurveda', 'https://facebook.com/karmaayurveda', 'https://instagram.com/karmaayurveda', 'https://youtube.com/karmaayurveda', '+91 99999 99999', 'https://whatsapp.com/channel/karmaayurveda', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=200&q=80', 'NABH/CERT/1937', '3 Years (Valid till Dec 2027)', 10, '2026-07-31 13:04:55', '2026-07-31 13:04:55');

-- --------------------------------------------------------

--
-- Table structure for table `therapies`
--

CREATE TABLE `therapies` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `image_alt` varchar(255) NOT NULL,
  `short_des` text NOT NULL,
  `long_des` text NOT NULL,
  `meta_title` varchar(255) NOT NULL,
  `meta_keywords` varchar(255) NOT NULL,
  `meta_des` varchar(255) NOT NULL,
  `disease_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `therapies`
--

INSERT INTO `therapies` (`id`, `name`, `image`, `image_alt`, `short_des`, `long_des`, `meta_title`, `meta_keywords`, `meta_des`, `disease_id`, `created_at`) VALUES
(1, 'Virechana', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', 'Ayurvedic Virechana therapy', 'Medicated purgation therapy that purifies the liver, gallbladder, and digestive tract.', 'Virechana is a dynamic cleansing method in Panchakarma that involves the administration of purgative substances to eliminate toxins (Ama) and excessive Pitta dosha from the liver, spleen, and gastrointestinal tract. It is highly beneficial for digestive disorders, skin conditions, and chronic headaches.', 'Ayurvedic Virechana Therapy & Liver Cleansing', 'virechana, panchakarma, liver detox, purgation therapy, ayurveda cleansing', 'Learn about Virechana, the medicated purgation therapy in Panchakarma that cleanses the liver, gallbladder, and digestive system.', 16, '2026-07-30 10:00:44'),
(2, 'Basti', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80', 'Ayurvedic Basti therapy', 'Medicated enema therapy considered the most effective Panchakarma treatment for Vata disorders.', 'Basti therapy involves introducing herbal decoctions, oils, or milk into the colon. Since the colon is the primary seat of Vata dosha, Basti is considered the ultimate therapy to manage joint pain, arthritis, neurological disorders, and chronic constipation by rejuvenating the gut microbiome.', 'Medicated Basti Therapy for Vata Balance', 'basti, ayurvedic enema, vata disorders, arthritis cure, panchakarma', 'Discover Basti, a cornerstone Panchakarma therapy utilizing herbal enemas to balance Vata, relieve joint stiffness, and restore vitality.', 13, '2026-07-30 10:00:44'),
(3, 'Raktamokshana', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80', 'Raktamokshana Blood Purification', 'Specialized blood-purification therapy to relieve systemic toxicity, skin issues, and inflammatory conditions.', 'Raktamokshana is a bloodletting therapy that eliminates localized toxins from the bloodstream. Traditionally performed using medicinal leeches (Jalauka) or cupping, it is highly recommended for eczema, psoriasis, chronic hives, and severe gout, restoring radiance and soothing inflammation.', 'Raktamokshana Blood Purification Therapy', 'raktamokshana, bloodletting, leech therapy, psoriasis, skin detox', 'Explore Raktamokshana, a classical blood-purification method using medicinal leeches to treat chronic skin conditions and gout.', 15, '2026-07-30 10:00:44'),
(4, 'Hot Water Therapy', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80', 'Hot Water Tub Therapy', 'Thermal therapy engineered to reduce strain on kidneys and heart, promoting skin-based toxin release.', 'Controlled hot water immersion therapy at 42°C is a modern natural treatment that opens sweat pores, enabling the skin to function as a third kidney. By stimulating vasodilation, it decreases creatinine, lowers blood pressure, and reduces cardiac workload, making it essential for renal support.', 'Hot Water Therapy for Kidney & Renal Care', 'hot water therapy, kidney detox, creatinine reduction, kidney failure, thermal therapy', 'Learn how controlled Hot Water Immersion Therapy at 42°C helps reduce creatinine and supports kidney recovery naturally.', 6, '2026-07-30 10:00:44');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `awards`
--
ALTER TABLE `awards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `blog_categories`
--
ALTER TABLE `blog_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `blog_post_tags`
--
ALTER TABLE `blog_post_tags`
  ADD PRIMARY KEY (`blog_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Indexes for table `blog_tags`
--
ALTER TABLE `blog_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `cancer_clinics`
--
ALTER TABLE `cancer_clinics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `disease_id` (`disease_id`);

--
-- Indexes for table `cancer_clinic_tags`
--
ALTER TABLE `cancer_clinic_tags`
  ADD PRIMARY KEY (`cancer_clinic_id`,`cancer_tag_id`),
  ADD KEY `cancer_tag_id` (`cancer_tag_id`);

--
-- Indexes for table `cancer_tags`
--
ALTER TABLE `cancer_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `clinics`
--
ALTER TABLE `clinics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `diseases`
--
ALTER TABLE `diseases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `clinic_id` (`clinic_id`);

--
-- Indexes for table `knee_clinics`
--
ALTER TABLE `knee_clinics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `disease_id` (`disease_id`);

--
-- Indexes for table `knee_clinic_tags`
--
ALTER TABLE `knee_clinic_tags`
  ADD PRIMARY KEY (`knee_clinic_id`,`knee_tag_id`),
  ADD KEY `knee_tag_id` (`knee_tag_id`);

--
-- Indexes for table `knee_tags`
--
ALTER TABLE `knee_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `media_articles`
--
ALTER TABLE `media_articles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `panchakarma_clinics`
--
ALTER TABLE `panchakarma_clinics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `disease_id` (`disease_id`);

--
-- Indexes for table `panchakarma_clinic_tags`
--
ALTER TABLE `panchakarma_clinic_tags`
  ADD PRIMARY KEY (`panchakarma_clinic_id`,`panchakarma_tag_id`),
  ADD KEY `panchakarma_tag_id` (`panchakarma_tag_id`);

--
-- Indexes for table `panchakarma_tags`
--
ALTER TABLE `panchakarma_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `site_faq`
--
ALTER TABLE `site_faq`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `site_profile`
--
ALTER TABLE `site_profile`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `therapies`
--
ALTER TABLE `therapies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `disease_id` (`disease_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `awards`
--
ALTER TABLE `awards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `blogs`
--
ALTER TABLE `blogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `blog_categories`
--
ALTER TABLE `blog_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `blog_tags`
--
ALTER TABLE `blog_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `cancer_clinics`
--
ALTER TABLE `cancer_clinics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cancer_tags`
--
ALTER TABLE `cancer_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `clinics`
--
ALTER TABLE `clinics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `diseases`
--
ALTER TABLE `diseases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `knee_clinics`
--
ALTER TABLE `knee_clinics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `knee_tags`
--
ALTER TABLE `knee_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `media_articles`
--
ALTER TABLE `media_articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `panchakarma_clinics`
--
ALTER TABLE `panchakarma_clinics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `panchakarma_tags`
--
ALTER TABLE `panchakarma_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `site_faq`
--
ALTER TABLE `site_faq`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `site_profile`
--
ALTER TABLE `site_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `therapies`
--
ALTER TABLE `therapies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `blog_post_tags`
--
ALTER TABLE `blog_post_tags`
  ADD CONSTRAINT `blog_post_tags_ibfk_1` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blog_post_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `blog_tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cancer_clinics`
--
ALTER TABLE `cancer_clinics`
  ADD CONSTRAINT `cancer_clinics_ibfk_1` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cancer_clinic_tags`
--
ALTER TABLE `cancer_clinic_tags`
  ADD CONSTRAINT `cancer_clinic_tags_ibfk_1` FOREIGN KEY (`cancer_clinic_id`) REFERENCES `cancer_clinics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cancer_clinic_tags_ibfk_2` FOREIGN KEY (`cancer_tag_id`) REFERENCES `cancer_tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `knee_clinics`
--
ALTER TABLE `knee_clinics`
  ADD CONSTRAINT `knee_clinics_ibfk_1` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `knee_clinic_tags`
--
ALTER TABLE `knee_clinic_tags`
  ADD CONSTRAINT `knee_clinic_tags_ibfk_1` FOREIGN KEY (`knee_clinic_id`) REFERENCES `knee_clinics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `knee_clinic_tags_ibfk_2` FOREIGN KEY (`knee_tag_id`) REFERENCES `knee_tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `panchakarma_clinics`
--
ALTER TABLE `panchakarma_clinics`
  ADD CONSTRAINT `panchakarma_clinics_ibfk_1` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `panchakarma_clinic_tags`
--
ALTER TABLE `panchakarma_clinic_tags`
  ADD CONSTRAINT `panchakarma_clinic_tags_ibfk_1` FOREIGN KEY (`panchakarma_clinic_id`) REFERENCES `panchakarma_clinics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `panchakarma_clinic_tags_ibfk_2` FOREIGN KEY (`panchakarma_tag_id`) REFERENCES `panchakarma_tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `therapies`
--
ALTER TABLE `therapies`
  ADD CONSTRAINT `therapies_ibfk_1` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
