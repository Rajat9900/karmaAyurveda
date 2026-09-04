import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { blogPosts } from './blogData';

// Hashing helper using native Node crypto (PBKDF2)
export function hashPassword(password: string): string {
  const salt = 'karma_ayurveda_salt_1937';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export async function setupDatabase() {
  console.log('Starting MySQL database initialization...');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  let connection;
  try {
    // 1. Connect without selecting database to check if it exists or create it
    connection = await mysql.createConnection(config);
    console.log('Connected to MySQL server successfully.');

    const dbName = process.env.DB_DATABASE || 'newkrm_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database "${dbName}" checked/created.`);

    // 2. Switch to the database
    await connection.query(`USE \`${dbName}\``);

    // 3. Create admins table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "admins" checked/created.');

    // 4. Create leads table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        disease VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "leads" checked/created.');

    // 5. Create blogs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        date VARCHAR(100) NOT NULL,
        image VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        meta_title VARCHAR(255) NULL,
        meta_keywords VARCHAR(255) NULL,
        meta_des TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "blogs" checked/created.');

    // Alter table blogs to add meta columns if they do not exist
    const [blogColumns] = await connection.query(`SHOW COLUMNS FROM blogs LIKE 'meta_title'`) as any[];
    if (blogColumns.length === 0) {
      await connection.query(`
        ALTER TABLE blogs 
        ADD COLUMN meta_title VARCHAR(255) NULL,
        ADD COLUMN meta_keywords VARCHAR(255) NULL,
        ADD COLUMN meta_des TEXT NULL
      `);
      console.log('Altered table "blogs" to add meta columns.');
    }

    // 5b. Create blog_categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "blog_categories" checked/created.');

    // 5c. Seed blog categories if table is empty
    const [categories] = await connection.query('SELECT * FROM blog_categories LIMIT 1') as any[];
    if (categories.length === 0) {
      console.log('Seeding initial blog categories...');
      const initialCategories = [
        { name: 'Kidney Health', slug: 'kidney-health' },
        { name: 'Diet & Nutrition', slug: 'diet-nutrition' },
        { name: 'Therapies', slug: 'therapies' },
        { name: 'Lifestyle', slug: 'lifestyle' },
        { name: 'Success Stories', slug: 'success-stories' }
      ];
      for (const cat of initialCategories) {
        await connection.query(
          'INSERT INTO blog_categories (name, slug) VALUES (?, ?)',
          [cat.name, cat.slug]
        );
      }
      console.log(`Seeded ${initialCategories.length} blog categories.`);
    }

    // 5d. Create blog_tags table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "blog_tags" checked/created.');

    // 5e. Create blog_post_tags join table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_post_tags (
        blog_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (blog_id, tag_id),
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "blog_post_tags" checked/created.');

    // 5f. Seed blog tags if empty
    const [tags] = await connection.query('SELECT * FROM blog_tags LIMIT 1') as any[];
    if (tags.length === 0) {
      console.log('Seeding initial blog tags...');
      const initialTags = [
        { name: 'Ayurveda', slug: 'ayurveda' },
        { name: 'Detox', slug: 'detox' },
        { name: 'Dialysis', slug: 'dialysis' },
        { name: 'Yoga', slug: 'yoga' },
        { name: 'Herbs', slug: 'herbs' },
        { name: 'Creatinine', slug: 'creatinine' },
        { name: 'Panchakarma', slug: 'panchakarma' }
      ];
      for (const tag of initialTags) {
        await connection.query(
          'INSERT INTO blog_tags (name, slug) VALUES (?, ?)',
          [tag.name, tag.slug]
        );
      }
      console.log(`Seeded ${initialTags.length} blog tags.`);
    }

    // 5g. Create diseases table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS diseases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        icon VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) NOT NULL,
        what_is_title VARCHAR(255) NOT NULL,
        bullets TEXT NOT NULL,
        main_image VARCHAR(255) NOT NULL,
        treatment_focus TEXT NOT NULL,
        testimonials TEXT NOT NULL,
        meta_title VARCHAR(255) NULL,
        meta_keywords VARCHAR(255) NULL,
        meta_des TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "diseases" checked/created.');

    // Alter table diseases to add meta columns if they do not exist
    const [diseaseColumns] = await connection.query(`SHOW COLUMNS FROM diseases LIKE 'meta_title'`) as any[];
    if (diseaseColumns.length === 0) {
      await connection.query(`
        ALTER TABLE diseases 
        ADD COLUMN meta_title VARCHAR(255) NULL,
        ADD COLUMN meta_keywords VARCHAR(255) NULL,
        ADD COLUMN meta_des TEXT NULL
      `);
      console.log('Altered table "diseases" to add meta columns.');
    }

    // Drop the legacy `treatments` JSON blob column — superseded by the disease_treatments table
    const [diseaseTreatmentsColumn] = await connection.query(`SHOW COLUMNS FROM diseases LIKE 'treatments'`) as any[];
    if (diseaseTreatmentsColumn.length > 0) {
      await connection.query(`ALTER TABLE diseases DROP COLUMN treatments`);
      console.log('Altered table "diseases" to drop legacy treatments column.');
    }

    // Alter table diseases to add the rich-text content column if it does not exist
    const [diseaseContentColumn] = await connection.query(`SHOW COLUMNS FROM diseases LIKE 'content'`) as any[];
    if (diseaseContentColumn.length === 0) {
      await connection.query(`
        ALTER TABLE diseases
        ADD COLUMN content LONGTEXT NULL
      `);
      console.log('Altered table "diseases" to add content column.');
    }

    // Alter table diseases to add the sort_order column if it does not exist,
    // backfilling it from the current alphabetical order so nothing visibly reshuffles
    const [diseaseSortOrderColumn] = await connection.query(`SHOW COLUMNS FROM diseases LIKE 'sort_order'`) as any[];
    if (diseaseSortOrderColumn.length === 0) {
      await connection.query(`
        ALTER TABLE diseases
        ADD COLUMN sort_order INT NOT NULL DEFAULT 0
      `);
      const [diseasesForOrder] = await connection.query('SELECT id FROM diseases ORDER BY name ASC') as any[];
      for (let i = 0; i < diseasesForOrder.length; i++) {
        await connection.query('UPDATE diseases SET sort_order = ? WHERE id = ?', [i, diseasesForOrder[i].id]);
      }
      console.log('Altered table "diseases" to add sort_order column and backfilled it.');
    }

    // 5h. Seed diseases if empty
    const [existingDiseases] = await connection.query('SELECT * FROM diseases LIMIT 1') as any[];
    if (existingDiseases.length === 0) {
      console.log('Seeding initial diseases...');
      
      const kidneyBullets = JSON.stringify([
        'Kidneys filter extra water and waste products out of your blood 24 hours a day.',
        'When kidney function declines, these toxic wastes start building up in the bloodstream.',
        'Early stage kidney damage often has no obvious symptoms, making it hard to detect.',
        'Ayurvedic care focuses on naturally rejuvenating nephrons to restore filtration capacity.'
      ]);
      const kidneyFocus = JSON.stringify([
        { title: 'Creatinine Management', desc: 'Using Mutral (diuretic) herbs like Gokshur and Varun to lower urea & creatinine.' },
        { title: 'Nephron Rejuvenation', desc: 'Rasayana herbs like Punarnava to revive damaged kidney filtration units.' },
        { title: 'GFR Correction', desc: 'Ayurvedic formulations aimed at progressively improving the Glomerular Filtration Rate.' },
        { title: 'Strict Fluid Regimen', desc: 'Precision fluid guidelines combined with custom sodium-potassium charts.' }
      ]);
      const kidneyTestimonials = JSON.stringify([
        { caption: 'Kidney Failure', patientName: 'Harish Sharma', comparisonImg: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80', videoId: 'b1-TE2uzmos', duration: '6:20' },
        { caption: 'Chronic Kidney Disease', patientName: 'Asha Devi', comparisonImg: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80', videoId: 'IdSQ2EcJnxE', duration: '4:45' }
      ]);

      const initialDiseases = [
        {
          name: 'Kidney Disease',
          slug: 'kidney',
          icon: '🫘',
          description: 'Holistic treatments to revive damaged kidney filters and reduce the need for dialysis.',
          title: 'Kidney Disease Treatment',
          subtitle: 'Comprehensive Ayurvedic Care to Rejuvenate Nephrons & Restrict Dialysis Need',
          what_is_title: 'What Is Kidney Disease?',
          bullets: kidneyBullets,
          main_image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
          treatment_focus: kidneyFocus,
          testimonials: kidneyTestimonials
        },
        {
          name: 'Chronic Kidney Care',
          slug: 'chronic-kidney',
          icon: '🫘',
          description: 'Holistic treatments to manage chronic kidney weakness and maintain health.',
          title: 'Chronic Kidney Disease Care',
          subtitle: 'Comprehensive Ayurvedic Care for Chronic Kidney Conditions',
          what_is_title: 'What Is Chronic Kidney Disease?',
          bullets: kidneyBullets,
          main_image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
          treatment_focus: kidneyFocus,
          testimonials: kidneyTestimonials
        },
        {
          name: 'Chronic Kidney Disease',
          slug: 'chronic-kidney-disease',
          icon: '🫘',
          description: 'Holistic Ayurveda Management of Glomerular Filtration & Creatinine.',
          title: 'Chronic Kidney Disease (CKD) Treatment',
          subtitle: 'Holistic Ayurveda Management of Glomerular Filtration & Creatinine',
          what_is_title: 'What Is Chronic Kidney Disease?',
          bullets: kidneyBullets,
          main_image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
          treatment_focus: kidneyFocus,
          testimonials: kidneyTestimonials
        },
        {
          name: 'Nephrotic Syndrome',
          slug: 'nephrotic-syndrome',
          icon: '🫘',
          description: 'Natural Rejuvenation of Renal Membrane and Glomeruli Filters.',
          title: 'Nephrotic Syndrome Care',
          subtitle: 'Natural Rejuvenation of Renal Membrane and Glomeruli Filters',
          what_is_title: 'What Is Nephrotic Syndrome?',
          bullets: kidneyBullets,
          main_image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
          treatment_focus: kidneyFocus,
          testimonials: kidneyTestimonials
        },
        {
          name: 'Polycystic Kidney Disease',
          slug: 'polycystic-kidney-disease',
          icon: '🫘',
          description: 'Ayurvedic Treatment for Cysts and Kidney Health Rejuvenation.',
          title: 'Polycystic Kidney Disease (PKD)',
          subtitle: 'Ayurvedic Treatment for Cysts and Kidney Health Rejuvenation',
          what_is_title: 'What Is Polycystic Kidney Disease?',
          bullets: kidneyBullets,
          main_image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
          treatment_focus: kidneyFocus,
          testimonials: kidneyTestimonials
        },
        {
          name: 'Kidney Failure',
          slug: 'kidney-failure',
          icon: '🫘',
          description: 'Natural Ayurvedic Therapies to Manage Creatinine & Urea Without Dialysis.',
          title: 'Kidney Failure Treatment',
          subtitle: 'Natural Ayurvedic Therapies to Manage Creatinine & Urea Without Dialysis',
          what_is_title: 'What Is Kidney Failure?',
          bullets: kidneyBullets,
          main_image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
          treatment_focus: kidneyFocus,
          testimonials: kidneyTestimonials
        },
        {
          name: 'Proteinuria',
          slug: 'proteinuria',
          icon: '🫘',
          description: 'Ayurvedic Rejuvenation to Restrict Protein Leakage and Restore Kidney Health.',
          title: 'Proteinuria Treatment',
          subtitle: 'Ayurvedic Rejuvenation to Restrict Protein Leakage and Restore Kidney Health',
          what_is_title: 'What Is Proteinuria?',
          bullets: kidneyBullets,
          main_image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
          treatment_focus: kidneyFocus,
          testimonials: kidneyTestimonials
        },
        {
          name: 'Cancer',
          slug: 'cancer',
          icon: '🎗️',
          description: 'Supportive and integrative Ayurvedic care for cellular recovery and Dosha balance.',
          title: 'Ayurvedic Cancer Care',
          subtitle: 'Supportive and Integrative Ayurvedic Care for Cellular Recovery & Dosha Balance',
          what_is_title: 'What Is Cancer?',
          bullets: JSON.stringify([
            'Cancer is a life-threatening disease caused by the uncontrolled growth and spread of abnormal cells.',
            'Normally, body cells divide, grow, and die in a regular cycle.',
            'When this process is disturbed, cells begin to multiply uncontrollably.',
            'These abnormal cells gather in one area, forming cysts or tumors.'
          ]),
          main_image: 'https://images.unsplash.com/photo-1579684389782-64d84b5e905d?auto=format&fit=crop&w=800&q=80',
          treatment_focus: JSON.stringify([
            { title: 'Immunity Boosting', desc: 'Rasayana therapies to enhance natural defense and combat toxins (Ama).' },
            { title: 'Side-Effect Mitigation', desc: 'Easing the fatigue and physical strain of conventional treatments.' },
            { title: 'Dosha Harmonization', desc: 'Targeted herbal formulas to calm highly aggravated Vata and Pitta.' },
            { title: 'Cellular Restoration', desc: 'Herbs like Tulsi, Ashwagandha, and Turmeric to support cellular repair.' }
          ]),
          testimonials: JSON.stringify([
            { caption: 'Mouth Cancer', patientName: 'Rajesh Kumar', comparisonImg: '/images/mouth_cancer_before_after.png', videoId: 'igRAgRP9KvM', duration: '4:15' },
            { caption: 'Blood Cancer', patientName: 'Meena Sharma', comparisonImg: '/images/blood_cancer_before_after.png', videoId: 'b1-TE2uzmos', duration: '5:20' }
          ])
        },
        {
          name: 'Liver Care',
          slug: 'liver',
          icon: '🍷',
          description: 'Natural rejuvenation and detoxification to restore metabolic liver health.',
          title: 'Liver Cirrhosis & Fatty Liver Care',
          subtitle: 'Natural Ayurvedic Detoxification & Cellular Rejuvenation for Liver Pathologies',
          what_is_title: 'What Is Liver Disease?',
          bullets: JSON.stringify([
            'The liver processes everything you eat and drink, filtering out harmful toxins.',
            'Fat accumulation or chronic inflammation can damage liver tissues over time.',
            'Damaged liver cells are replaced by scar tissue, leading to liver cirrhosis.',
            'Natural therapies help detoxify liver cells and restore healthy metabolic enzyme levels.'
          ]),
          main_image: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80',
          treatment_focus: JSON.stringify([
            { title: 'Bile Regulation', desc: 'Balancing Ranjaka Pitta to optimize liver secretions and enzyme profiles.' },
            { title: 'Hepatocyte Protection', desc: 'Using Katuki and Bhumi Amla to reduce liver inflammation & scarring.' },
            { title: 'Toxin Flush (Ama)', desc: 'Gentle colon cleanses and herbal combinations to flush out stored liver toxins.' },
            { title: 'Metabolism Boost', desc: 'Strengthening the digestive fire (Jatharagni) to prevent future fatty deposits.' }
          ]),
          testimonials: JSON.stringify([
            { caption: 'Liver Cirrhosis', patientName: 'Amit Patel', comparisonImg: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80', videoId: 'IdSQ2EcJnxE', duration: '5:10' },
            { caption: 'Fatty Liver Reversal', patientName: 'Vikram Malhotra', comparisonImg: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80', videoId: 'igRAgRP9KvM', duration: '3:40' }
          ])
        },
        {
          name: 'Psoriasis',
          slug: 'psoriasis',
          icon: '🌿',
          description: 'Root-cause healing and blood purification therapies for psoriasis, eczema, and skin scaling.',
          title: 'Psoriasis & Skin Treatment',
          subtitle: 'Holistic Blood Purification and Dosha Management for Lasting Skin Health',
          what_is_title: 'What Is Psoriasis?',
          bullets: JSON.stringify([
            'Psoriasis is a chronic skin disorder that causes cells to build up rapidly on the skin\'s surface.',
            'This rapid growth leads to thick, red, scaly patches that can itch or feel painful.',
            'In Ayurveda, skin issues are treated by purifying the blood (Rakta Shodhana) and balancing doshas.',
            'Addressing the root cause helps soothe inflammation and keep skin clear long-term.'
          ]),
          main_image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
          treatment_focus: JSON.stringify([
            { title: 'Blood Detox (Rakta)', desc: 'Blood-purifying herbs like Neem, Manjistha, and Khadir to soothe skin scaling.' },
            { title: 'Vata-Kapha Pacification', desc: 'Balancing the specific doshas responsible for dryness, itching, and plaque formation.' },
            { title: 'Soothing Topical Oils', desc: 'Psoria-protective Ayurvedic medicated oils to moisturize and restore skin layers.' },
            { title: 'Gut-Skin Axis Balance', desc: 'Improving digestional absorption to stop the accumulation of skin-damaging toxins (Visha).' }
          ]),
          testimonials: JSON.stringify([
            { caption: 'Plaque Psoriasis Reversal', patientName: 'Sanjay Verma', comparisonImg: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80', videoId: 'igRAgRP9KvM', duration: '4:05' },
            { caption: 'Scalp Psoriasis Recovery', patientName: 'Rekha Joshi', comparisonImg: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80', videoId: 'b1-TE2uzmos', duration: '3:50' }
          ])
        },
        {
          name: 'Parkinson\'s Care',
          slug: 'parkinson',
          icon: '🧠',
          description: 'Vata pacifying and neuro-protective Ayurvedic therapies for balance and movement strength.',
          title: 'Parkinson\'s & Neurological Care',
          subtitle: 'Vata Pacifying and Neuro-Protective Ayurvedic Therapies for Balance & Strength',
          what_is_title: 'What Is Parkinson\'s?',
          bullets: JSON.stringify([
            'Parkinson\'s is a progressive nervous system disorder that primarily affects physical movement.',
            'It develops due to the gradual breakdown and loss of dopamine-producing brain cells.',
            'Common signs include hand tremors, limb stiffness, and slow physical movement.',
            'Ayurvedic neuro-protective therapies focus on pacifying Vata dosha to support nerve health.'
          ]),
          main_image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
          treatment_focus: JSON.stringify([
            { title: 'Vata Control (Kampa Vata)', desc: 'Warm, grounding therapies and herbal oils to calm the nervous system (Majja Dhatu).' },
            { title: 'Natural L-Dopa Herbs', desc: 'Utilizing Kapikachhu and Ashwagandha to naturally feed and protect neural pathways.' },
            { title: 'Panchakarma (Basti/Nasya)', desc: 'Specialized cleansing enemas and nasal drops to ground hyperactive neural energies.' },
            { title: 'Balance Restoration', desc: 'Gentle motor exercises and customized herbal powders to regain coordination.' }
          ]),
          testimonials: JSON.stringify([
            { caption: 'Tremor Management', patientName: 'Gopal Prasad', comparisonImg: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80', videoId: 'IdSQ2EcJnxE', duration: '5:30' },
            { caption: 'Mobility Support', patientName: 'Sushma Swaraj', comparisonImg: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80', videoId: 'igRAgRP9KvM', duration: '4:20' }
          ])
        },
        {
          name: 'Diabetes',
          slug: 'diabetes',
          icon: '🩸',
          description: 'Holistic approaches combining diet, lifestyle, and Ayurvedic medicines for blood sugar management.',
          title: 'Diabetes Reversal & Management',
          subtitle: 'Correcting Liver & Pancreatic Metabolism (Agni) to Restore Insulin Sensitivity',
          what_is_title: 'What Is Diabetes?',
          bullets: JSON.stringify([
            'Diabetes is a metabolic condition that affects how your body turns food into energy.',
            'Insulin resistance prevents cells from absorbing glucose, leading to high blood sugar.',
            'Uncontrolled diabetes can damage blood vessels, nerves, kidneys, and other vital organs.',
            'Holistic Ayurvedic care targets metabolic correction to restore natural insulin sensitivity.'
          ]),
          main_image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80',
          treatment_focus: JSON.stringify([
            { title: 'Pancreatic Health', desc: 'Bitter herbs like Gudmar, Karela, and Methi to trigger beta-cell secretions.' },
            { title: 'Digestive Correction', desc: 'Strengthening the metabolic fire to digest excess sugar and prevent toxin (Ama) accumulation.' },
            { title: 'Neuropathy Defense', desc: 'Nerve-strengthening Rasayana blends to avoid diabetic complications.' },
            { title: 'Ayurvedic Diet Chart', desc: 'Strict customized carbohydrate limits combined with detoxifying raw fiber plans.' }
          ]),
          testimonials: JSON.stringify([
            { caption: 'Blood Sugar Reversal', patientName: 'Vijay Yadav', comparisonImg: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80', videoId: 'b1-TE2uzmos', duration: '4:50' },
            { caption: 'Insulin-Free Life', patientName: 'Sunita Gupta', comparisonImg: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80', videoId: 'IdSQ2EcJnxE', duration: '5:05' }
          ])
        },
        {
          name: 'Arthritis',
          slug: 'arthritis',
          icon: '🦴',
          description: 'Ayurvedic treatments for joint pain, inflammation, and stiffness using herbal formulations and therapies.',
          title: 'Arthritis & Joint Care',
          subtitle: 'Grounding Excess Vata and Flushing Gut Toxins (Ama) from Joint Cavities',
          what_is_title: 'What Is Arthritis?',
          bullets: JSON.stringify([
            'Arthritis is a common disorder causing painful inflammation and stiffness in joints.',
            'It can occur due to cartilage wear-and-tear or auto-immune response (Rheumatoid).',
            'Toxins (Ama) accumulating in the joints can worsen inflammation and reduce flexibility.',
            'Warm herbal oil therapies and lifestyle management help soothe joints and restore mobility.'
          ]),
          main_image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
          treatment_focus: JSON.stringify([
            { title: 'Ama Digestives (Deepan-Pachan)', desc: 'Using spices and herbs like Guggulu and Ginger to dissolve gut toxins before they travel to joints.' },
            { title: 'Vata Pacifying Massages', desc: 'Snehana (warm oil lubrication) with specialized oils like Mahanarayan Taila.' },
            { title: 'Anti-Inflammatory Herbs', desc: 'Shallaki, Ashwagandha, and Turmeric to soothe joint swelling and restore ease of movement.' },
            { title: 'Gentle Joint Sukshma Vyayama', desc: 'Micro-movements and guided postures to retain cartilage spacing and avoid stiffness.' }
          ]),
          testimonials: JSON.stringify([
            { caption: 'Rheumatoid Arthritis Care', patientName: 'Kailash Chand', comparisonImg: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80', videoId: 'IdSQ2EcJnxE', duration: '6:10' },
            { caption: 'Osteoarthritis Mobility', patientName: 'Kamlesh Devi', comparisonImg: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80', videoId: 'igRAgRP9KvM', duration: '4:30' }
          ])
        },
        {
          name: 'Asthma',
          slug: 'asthma',
          icon: '🫁',
          description: 'Natural remedies to strengthen the respiratory system and manage breathing difficulties.',
          title: 'Asthma & Respiratory Care',
          subtitle: 'Clearing Kapha Congestion and Rebuilding Lung Tissue Immunity Naturally',
          what_is_title: 'What Is Asthma?',
          bullets: JSON.stringify([
            'Asthma is a chronic condition that inflames and narrows the lungs\' airways.',
            'This narrowing causes periods of wheezing, chest tightness, and shortness of breath.',
            'Allergens, pollution, and Kapha dosha congestion in the chest are common triggers.',
            'Treatments aim to clear respiratory pathways, reduce airway sensitivity, and boost immunity.'
          ]),
          main_image: 'https://images.unsplash.com/photo-1628863012283-7472be757cef?auto=format&fit=crop&w=800&q=80',
          treatment_focus: JSON.stringify([
            { title: 'Bronchodilation', desc: 'Using Vasaka (Adhatoda vasica) and Pippali to relax air passages and thin Kapha mucus.' },
            { title: 'Pranavaha Srotas Cleansing', desc: 'Ayurvedic herbs and hot steam therapy to decongest bronchioles and alleviate cough.' },
            { title: 'Immunity Rebuilding', desc: 'Strengthening lung tissues using Rasayanas like Chitrabhadi and Haridrakhanda.' },
            { title: 'Pranayama Guidance', desc: 'Targeted breathing protocols to expand overall tidal capacity and lung durability.' }
          ]),
          testimonials: JSON.stringify([
            { caption: 'Inhaler-Free Life', patientName: 'Rajeev Saxena', comparisonImg: 'https://images.unsplash.com/photo-1628863012283-7472be757cef?auto=format&fit=crop&w=600&q=80', videoId: 'igRAgRP9KvM', duration: '4:00' },
            { caption: 'Allergic Asthma Control', patientName: 'Anjali Mehta', comparisonImg: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80', videoId: 'b1-TE2uzmos', duration: '5:12' }
          ])
        },
        {
          name: 'Skin Diseases',
          slug: 'skin-diseases',
          icon: '🌿',
          description: 'Effective treatments for psoriasis, eczema, acne, and other skin conditions through blood purification.',
          title: 'Skin Diseases Treatment',
          subtitle: 'Effective Ayurvedic Therapies for Eczema, Acne, and Psoriasis',
          what_is_title: 'What Are Skin Diseases?',
          bullets: JSON.stringify([
            'Skin disorders range from mild allergies and acne to chronic conditions like psoriasis or eczema.',
            'Ayurveda views skin issues as an imbalance in Rakta (blood) and Pitta dosha.',
            'Detoxification helps clear deep-seated toxins causing skin irritations.',
            'Targeted herbal applications soothe the external layers while restoring skin health from within.'
          ]),
          main_image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
          treatment_focus: JSON.stringify([
            { title: 'Blood Cleansing', desc: 'Using Neem and Khadir to purify blood channels and calm scaling.' },
            { title: 'Inflammation Relief', desc: 'Topical soothing pastes and cold-pressed coconut-herb formulations.' }
          ]),
          testimonials: JSON.stringify([
            { caption: 'Skin Recovery', patientName: 'Sanjay Verma', comparisonImg: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80', videoId: 'igRAgRP9KvM', duration: '4:05' }
          ])
        },
        {
          name: 'Digestive Disorders',
          slug: 'digestive-disorders',
          icon: '🔥',
          description: 'Solutions for acidity, IBS, constipation, and indigestion by balancing the digestive fire (Agni).',
          title: 'Digestive Disorders & IBS Care',
          subtitle: 'Reviving Digestive Fire (Agni) to Eliminate Indigestion, IBS, and Acidity',
          what_is_title: 'What Are Digestive Disorders?',
          bullets: JSON.stringify([
            'Poor eating habits or high stress levels weaken the digestive fire (Agni).',
            'This leads to partially digested food turning into sticky toxins (Ama) in the gut.',
            'Common symptoms include bloating, gas, chronic acidity, constipation, or IBS.',
            'Ayurvedic therapies focus on deepan-pachan (appetizing-digesting) and cleansing channels.'
          ]),
          main_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          treatment_focus: JSON.stringify([
            { title: 'Agni Correction', desc: 'Prescribing digestive stimulants like Hingwashtak Churna and Ginger.' },
            { title: 'Ama Cleansing', desc: 'Panchakarma therapies like Virechana to clean the gastrointestinal tract.' }
          ]),
          testimonials: JSON.stringify([
            { caption: 'IBS Management', patientName: 'Vijay Yadav', comparisonImg: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80', videoId: 'b1-TE2uzmos', duration: '4:50' }
          ])
        },
        {
          name: 'Migraine',
          slug: 'migraine',
          icon: '🧠',
          description: 'Root-cause treatment for chronic headaches and migraines through therapies like Shirodhara and Nasya.',
          title: 'Migraine & Chronic Headache Care',
          subtitle: 'Ayurvedic Treatment for Migraines and Neurological Headaches',
          what_is_title: 'What Is Migraine?',
          bullets: JSON.stringify([
            'Migraine is characterized by intense throbbing pain, usually on one side of the head.',
            'It is often accompanied by nausea, vomiting, and extreme sensitivity to light/sound.',
            'Ayurveda identifies high Pitta and Vata imbalances as the primary trigger.',
            'Calming therapies directly reduce nervous stress and relieve chronic pain.'
          ]),
          main_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
          treatment_focus: JSON.stringify([
            { title: 'Nasal Therapy (Nasya)', desc: 'Administering medicated ghee drops in nasal passages to soothe head channels.' },
            { title: 'Shirodhara', desc: 'Pouring warm herbal oils onto the forehead to relax the nervous system.' }
          ]),
          testimonials: JSON.stringify([
            { caption: 'Migraine Reversal', patientName: 'Rekha Joshi', comparisonImg: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80', videoId: 'igRAgRP9KvM', duration: '3:50' }
          ])
        },
        {
          name: 'PCOD / PCOS',
          slug: 'pcod-pcos',
          icon: '🌸',
          description: 'Ayurvedic management of hormonal imbalances through personalized diet, lifestyle, and herbal medicines.',
          title: 'PCOD & PCOS Treatment',
          subtitle: 'Correcting Hormonal Imbalances and Ovarian Metabolism Naturally',
          what_is_title: 'What Is PCOD/PCOS?',
          bullets: JSON.stringify([
            'PCOS is a hormonal disorder causing enlarged ovaries with small cysts on the outer edges.',
            'Symptoms include irregular periods, excess facial hair, weight gain, and acne.',
            'Ayurveda views PCOS as a Kapha-Artava system congestion and low metabolism.',
            'Hormonal balance is restored using cleansing therapies and specific endocrine-supporting herbs.'
          ]),
          main_image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
          treatment_focus: JSON.stringify([
            { title: 'Ovarian Balance', desc: 'Using herbs like Shatavari, Kanchanar Guggulu, and Aloe Vera to reduce cyst size.' },
            { title: 'Metabolism Boost', desc: 'Diet modifications combined with fat-burning exercises to correct insulin sensitivity.' }
          ]),
          testimonials: JSON.stringify([
            { caption: 'PCOS Recovery', patientName: 'Sunita Gupta', comparisonImg: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80', videoId: 'IdSQ2EcJnxE', duration: '5:05' }
          ])
        },
        {
          name: 'Obesity',
          slug: 'obesity',
          icon: '⚖️',
          description: 'Weight management programs focusing on metabolism correction and detoxification.',
          title: 'Ayurvedic Obesity Management',
          subtitle: 'Correcting Fat Metabolism (Medo Dhatu) to Achieve Sustainable Weight Loss',
          what_is_title: 'What Is Obesity?',
          bullets: JSON.stringify([
            'Obesity is a complex disease involving an excessive amount of body fat.',
            'In Ayurveda, it is termed Sthaulya, caused by slow metabolism and blocked fat channels.',
            'A sluggish digestive fire leads to tissue buildup instead of energy generation.',
            'Detoxification and deep tissue stimulation help kickstart meda (fat) metabolism.'
          ]),
          main_image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
          treatment_focus: JSON.stringify([
            { title: 'Dry Powder Massage (Udvartana)', desc: 'Using herbal powders to break down subcutaneous fat tissues.' },
            { title: 'Meda Cleansing', desc: 'Herbs like Guggulu and Triphala to clear fat channels and optimize lipid profiles.' }
          ]),
          testimonials: JSON.stringify([
            { caption: 'Weight Loss Reversal', patientName: 'Vikram Malhotra', comparisonImg: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80', videoId: 'igRAgRP9KvM', duration: '3:40' }
          ])
        }
      ];

      for (const dis of initialDiseases) {
        await connection.query(
          `INSERT INTO diseases (name, slug, icon, description, title, subtitle, what_is_title, bullets, main_image, treatment_focus, testimonials, meta_title, meta_keywords, meta_des) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            dis.name, 
            dis.slug, 
            dis.icon, 
            dis.description, 
            dis.title, 
            dis.subtitle, 
            dis.what_is_title, 
            dis.bullets, 
            dis.main_image, 
            dis.treatment_focus, 
            dis.testimonials,
            dis.title,
            dis.name.toLowerCase() + ', treatment, ayurveda, healing',
            dis.description
          ]
        );
      }
      console.log(`Seeded ${initialDiseases.length} diseases.`);
    }

    // 5ha. Create disease_treatments table (sub-pages for individual "Treatments We Offer" cards)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS disease_treatments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        disease_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        image VARCHAR(500) NULL,
        short_description TEXT NULL,
        content LONGTEXT NULL,
        meta_title VARCHAR(255) NULL,
        meta_des TEXT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "disease_treatments" checked/created.');

    // Alter table disease_treatments to add the short_description column if it does not exist
    const [treatmentShortDescColumn] = await connection.query(`SHOW COLUMNS FROM disease_treatments LIKE 'short_description'`) as any[];
    if (treatmentShortDescColumn.length === 0) {
      await connection.query(`ALTER TABLE disease_treatments ADD COLUMN short_description TEXT NULL`);
      console.log('Altered table "disease_treatments" to add short_description column.');
    }

    // 5ha. Create clinics table (our own hospital branches — referenced by doctors.clinic_id below)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clinics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        map_url TEXT NULL,
        image VARCHAR(255) NULL,
        video_url VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "clinics" checked/created.');

    // Alter table clinics to add the video_url column if it does not exist
    const [clinicVideoUrlColumn] = await connection.query(`SHOW COLUMNS FROM clinics LIKE 'video_url'`) as any[];
    if (clinicVideoUrlColumn.length === 0) {
      await connection.query(`ALTER TABLE clinics ADD COLUMN video_url VARCHAR(500) NULL`);
      console.log('Altered table "clinics" to add video_url column.');
    }

    // 5hb. Seed clinics if empty
    const [existingClinics] = await connection.query('SELECT * FROM clinics LIMIT 1') as any[];
    if (existingClinics.length === 0) {
      console.log('Seeding initial clinics...');
      const initialClinics = [
        {
          slug: 'delhi-clinic',
          name: 'Karma Ayurveda Delhi Clinic',
          address: 'Pocket 24, Sector 24, Rohini, New Delhi, Delhi 110085',
          city: 'Delhi',
          phone: '+91-99719-28080',
          email: 'delhi@karmaayurveda.com',
          map_url: 'https://maps.google.com',
          image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
        },
        {
          slug: 'mumbai-clinic',
          name: 'Karma Ayurveda Mumbai Clinic',
          address: 'Bandra West, Link Road, Mumbai, Maharashtra',
          city: 'Mumbai',
          phone: '+91-88888-88888',
          email: 'mumbai@karmaayurveda.com',
          map_url: 'https://maps.google.com',
          image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80'
        },
        {
          slug: 'bengaluru-clinic',
          name: 'Karma Ayurveda Bengaluru Clinic',
          address: 'Koramangala, Bengaluru, Karnataka',
          city: 'Bengaluru',
          phone: '+91-77777-77777',
          email: 'bengaluru@karmaayurveda.com',
          map_url: 'https://maps.google.com',
          image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'
        },
        {
          slug: 'jaipur-clinic',
          name: 'Karma Ayurveda Jaipur Clinic',
          address: 'Malviya Nagar, Jaipur, Rajasthan',
          city: 'Jaipur',
          phone: '+91-66666-66666',
          email: 'jaipur@karmaayurveda.com',
          map_url: 'https://maps.google.com',
          image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
        }
      ];
      for (const c of initialClinics) {
        await connection.query(
          `INSERT INTO clinics (slug, name, address, city, phone, email, map_url, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [c.slug, c.name, c.address, c.city, c.phone, c.email, c.map_url, c.image]
        );
      }
      console.log(`Seeded ${initialClinics.length} clinics.`);
    }

    // 5hc. Create clinic_tags table (generic tags for the main "Our Clinics" list)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clinic_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "clinic_tags" checked/created.');

    // 5hd. Create clinic_clinic_tags junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clinic_clinic_tags (
        clinic_id INT NOT NULL,
        clinic_tag_id INT NOT NULL,
        PRIMARY KEY (clinic_id, clinic_tag_id),
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
        FOREIGN KEY (clinic_tag_id) REFERENCES clinic_tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "clinic_clinic_tags" checked/created.');

    // 5hf. Create clinic_gallery table (multiple photos per clinic)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clinic_gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT NOT NULL,
        image VARCHAR(500) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "clinic_gallery" checked/created.');

    // 5hg. Create clinic_doctors table (lightweight, clinic-specific doctor entries — separate from the global "doctors" table)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clinic_doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        about TEXT NULL,
        image VARCHAR(500) NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "clinic_doctors" checked/created.');

    // Alter table clinic_doctors to add the image column if it does not exist (table may already exist from an earlier migration)
    const [clinicDoctorImageColumn] = await connection.query(`SHOW COLUMNS FROM clinic_doctors LIKE 'image'`) as any[];
    if (clinicDoctorImageColumn.length === 0) {
      await connection.query(`ALTER TABLE clinic_doctors ADD COLUMN image VARCHAR(500) NULL AFTER about`);
      console.log('Altered table "clinic_doctors" to add image column.');
    }

    // 5he. Create service_locations table ("Other Locations We Serve" — a separate list from Our Clinics)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NULL,
        content LONGTEXT NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        map_url TEXT NULL,
        image VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "service_locations" checked/created.');

    // Alter table service_locations to add the title/content columns if they do not exist
    const [locationTitleColumn] = await connection.query(`SHOW COLUMNS FROM service_locations LIKE 'title'`) as any[];
    if (locationTitleColumn.length === 0) {
      await connection.query(`ALTER TABLE service_locations ADD COLUMN title VARCHAR(255) NULL AFTER name`);
      console.log('Altered table "service_locations" to add title column.');
    }
    const [locationContentColumn] = await connection.query(`SHOW COLUMNS FROM service_locations LIKE 'content'`) as any[];
    if (locationContentColumn.length === 0) {
      await connection.query(`ALTER TABLE service_locations ADD COLUMN content LONGTEXT NULL AFTER title`);
      console.log('Altered table "service_locations" to add content column.');
    }

    // 5hh. Create location_diseases junction table (which diseases a "location we serve" should show up under)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS location_diseases (
        location_id INT NOT NULL,
        disease_id INT NOT NULL,
        PRIMARY KEY (location_id, disease_id),
        FOREIGN KEY (location_id) REFERENCES service_locations(id) ON DELETE CASCADE,
        FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "location_diseases" checked/created.');

    // 5i. Create doctors table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        education VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        detail TEXT NOT NULL,
        image VARCHAR(255) NOT NULL,
        clinic_id INT NULL,
        is_owner TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "doctors" checked/created.');

    // 5j. Seed doctors if empty
    const [existingDoctors] = await connection.query('SELECT * FROM doctors LIMIT 1') as any[];
    if (existingDoctors.length === 0) {
      console.log('Seeding initial doctors...');
      
      // Fetch first clinic if exists to link Dr. Puneet Dhawan as a default
      const [existingClinics] = await connection.query('SELECT id FROM clinics LIMIT 1') as any[];
      const defaultClinicId = existingClinics.length > 0 ? existingClinics[0].id : null;

      const initialDoctors = [
        {
          name: 'Dr. Puneet Dhawan',
          education: 'BAMS',
          designation: 'Principal Ayurvedic Kidney Specialist',
          detail: 'A 5th-generation Ayurvedic physician, Dr. Puneet has transformed the lives of over 1.5 lakh kidney patients globally. With a deep rooted belief in ancient Ayurvedic science, he has successfully proven that kidney failure can be reversed naturally, without the need for painful dialysis or transplants.',
          image: 'https://www.karmaayurveda.com/new/assets/image/dr-puneet.png',
          clinic_id: defaultClinicId,
          is_owner: 1
        },
        {
          name: 'Dr. Nikhil Diwakar Sharma',
          education: 'Ayurveda Doctor, BAMS',
          designation: 'Ayurveda Physician & Meditative Healer',
          detail: 'Dr. Nikhil Diwakar Sharma is BAMS graduate from Kurukshetra University. He is an accomplished Ayurveda physician, speaker and meditative healer and has a vast experience of 12 years in curing various diseases like arthritis, skin diseases, kidney problems, liver disorders, etc.',
          image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
          clinic_id: defaultClinicId,
          is_owner: 0
        },
        {
          name: 'Dr. Krutika Awasthi',
          education: 'Ayurveda Doctor, BAMS',
          designation: 'Chronic Lifestyle Disease Specialist',
          detail: 'Dr. Krutika Awasthi is BAMS Graduate from Ch. Brahm Prakash Ayurved Charak Sansthan, New Delhi. She is an accomplished Ayurveda physician, speaker, and healer. She has 3+ years of experience in treating various chronic lifestyle diseases especially kidney problems, heart, diabetes, blood pressure, skin diseases, female problems, arthritis, etc.',
          image: 'https://images.unsplash.com/photo-1594824432258-2eb75b067f92?auto=format&fit=crop&w=256&h=256&q=80',
          clinic_id: defaultClinicId,
          is_owner: 0
        },
        {
          name: 'Dr. Monika Yadav',
          education: 'BAMS, MBA(HM)',
          designation: 'Senior Panchakarma Consultant',
          detail: 'She completed her BAMS from Shri Krishna Govt. Ayurvedic College, Kurukshetra, Haryana. With 12+ years of experience in ancient Ayurveda and Panchakarma, she specializes in chronic progressive conditions like liver & kidney disorders, gynecological issues, skin disease, and arthritis, using classical medicines and lifestyle guidance.',
          image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
          clinic_id: defaultClinicId,
          is_owner: 0
        },
        {
          name: 'Dr. Deepak K Jain',
          education: 'Ayurvedacharya (BAMS), Panchakarma Consultant',
          designation: 'Classical Ayurveda Expert',
          detail: 'He completed his BAMS from Govt. Ayurved College Gwalior (MP) and brings 20+ years of experience in classical Ayurveda and Panchakarma. He specializes in chronic progressive conditions like liver & kidney disorders, joint diseases, skin ailments, motor neuron disease, Parkinson\'s, and more.',
          image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
          clinic_id: defaultClinicId,
          is_owner: 0
        }
      ];

      for (const doc of initialDoctors) {
        await connection.query(
          `INSERT INTO doctors (name, education, designation, detail, image, clinic_id, is_owner) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [doc.name, doc.education, doc.designation, doc.detail, doc.image, doc.clinic_id, doc.is_owner]
        );
      }
      console.log(`Seeded ${initialDoctors.length} doctors.`);
    }

    // 5k. Create therapies table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS therapies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NULL UNIQUE,
        image VARCHAR(255) NOT NULL,
        image_alt VARCHAR(255) NOT NULL,
        short_des TEXT NOT NULL,
        long_des TEXT NOT NULL,
        meta_title VARCHAR(255) NOT NULL,
        meta_keywords VARCHAR(255) NOT NULL,
        meta_des VARCHAR(255) NOT NULL,
        disease_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "therapies" checked/created.');

    // Alter table therapies to add the slug column if it does not exist,
    // backfilling it from each therapy's current name so nothing breaks
    const [therapySlugColumn] = await connection.query(`SHOW COLUMNS FROM therapies LIKE 'slug'`) as any[];
    if (therapySlugColumn.length === 0) {
      await connection.query(`ALTER TABLE therapies ADD COLUMN slug VARCHAR(255) NULL`);
      const [therapiesForSlug] = await connection.query('SELECT id, name FROM therapies') as any[];
      const usedSlugs = new Set<string>();
      for (const th of therapiesForSlug) {
        let baseSlug = th.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        let slug = baseSlug;
        let suffix = 2;
        while (usedSlugs.has(slug)) {
          slug = `${baseSlug}-${suffix}`;
          suffix++;
        }
        usedSlugs.add(slug);
        await connection.query('UPDATE therapies SET slug = ? WHERE id = ?', [slug, th.id]);
      }
      await connection.query(`ALTER TABLE therapies ADD CONSTRAINT therapies_slug_unique UNIQUE (slug)`);
      console.log('Altered table "therapies" to add slug column and backfilled it.');
    }

    // 5l. Seed therapies if empty
    const [existingTherapies] = await connection.query('SELECT * FROM therapies LIMIT 1') as any[];
    if (existingTherapies.length === 0) {
      console.log('Seeding initial therapies...');
      
      const [diseasesList] = (await connection.query('SELECT id, slug FROM diseases')) as any[];
      const getDiseaseIdBySlug = (slug: string) => {
        const match = diseasesList.find((d: any) => d.slug === slug);
        return match ? match.id : (diseasesList[0]?.id || null);
      };

      const initialTherapies = [
        {
          name: 'Virechana',
          slug: 'virechana',
          image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
          image_alt: 'Ayurvedic Virechana therapy',
          short_des: 'Medicated purgation therapy that purifies the liver, gallbladder, and digestive tract.',
          long_des: 'Virechana is a dynamic cleansing method in Panchakarma that involves the administration of purgative substances to eliminate toxins (Ama) and excessive Pitta dosha from the liver, spleen, and gastrointestinal tract. It is highly beneficial for digestive disorders, skin conditions, and chronic headaches.',
          meta_title: 'Ayurvedic Virechana Therapy & Liver Cleansing',
          meta_keywords: 'virechana, panchakarma, liver detox, purgation therapy, ayurveda cleansing',
          meta_des: 'Learn about Virechana, the medicated purgation therapy in Panchakarma that cleanses the liver, gallbladder, and digestive system.',
          disease_id: getDiseaseIdBySlug('digestive-disorders')
        },
        {
          name: 'Basti',
          slug: 'basti',
          image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80',
          image_alt: 'Ayurvedic Basti therapy',
          short_des: 'Medicated enema therapy considered the most effective Panchakarma treatment for Vata disorders.',
          long_des: 'Basti therapy involves introducing herbal decoctions, oils, or milk into the colon. Since the colon is the primary seat of Vata dosha, Basti is considered the ultimate therapy to manage joint pain, arthritis, neurological disorders, and chronic constipation by rejuvenating the gut microbiome.',
          meta_title: 'Medicated Basti Therapy for Vata Balance',
          meta_keywords: 'basti, ayurvedic enema, vata disorders, arthritis cure, panchakarma',
          meta_des: 'Discover Basti, a cornerstone Panchakarma therapy utilizing herbal enemas to balance Vata, relieve joint stiffness, and restore vitality.',
          disease_id: getDiseaseIdBySlug('arthritis')
        },
        {
          name: 'Raktamokshana',
          slug: 'raktamokshana',
          image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
          image_alt: 'Raktamokshana Blood Purification',
          short_des: 'Specialized blood-purification therapy to relieve systemic toxicity, skin issues, and inflammatory conditions.',
          long_des: 'Raktamokshana is a bloodletting therapy that eliminates localized toxins from the bloodstream. Traditionally performed using medicinal leeches (Jalauka) or cupping, it is highly recommended for eczema, psoriasis, chronic hives, and severe gout, restoring radiance and soothing inflammation.',
          meta_title: 'Raktamokshana Blood Purification Therapy',
          meta_keywords: 'raktamokshana, bloodletting, leech therapy, psoriasis, skin detox',
          meta_des: 'Explore Raktamokshana, a classical blood-purification method using medicinal leeches to treat chronic skin conditions and gout.',
          disease_id: getDiseaseIdBySlug('skin-diseases')
        },
        {
          name: 'Hot Water Therapy',
          slug: 'hot-water-therapy',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
          image_alt: 'Hot Water Tub Therapy',
          short_des: 'Thermal therapy engineered to reduce strain on kidneys and heart, promoting skin-based toxin release.',
          long_des: 'Controlled hot water immersion therapy at 42°C is a modern natural treatment that opens sweat pores, enabling the skin to function as a third kidney. By stimulating vasodilation, it decreases creatinine, lowers blood pressure, and reduces cardiac workload, making it essential for renal support.',
          meta_title: 'Hot Water Therapy for Kidney & Renal Care',
          meta_keywords: 'hot water therapy, kidney detox, creatinine reduction, kidney failure, thermal therapy',
          meta_des: 'Learn how controlled Hot Water Immersion Therapy at 42°C helps reduce creatinine and supports kidney recovery naturally.',
          disease_id: getDiseaseIdBySlug('kidney-failure')
        }
      ];

      for (const th of initialTherapies) {
        await connection.query(
          `INSERT INTO therapies (name, slug, image, image_alt, short_des, long_des, meta_title, meta_keywords, meta_des, disease_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [th.name, th.slug, th.image, th.image_alt, th.short_des, th.long_des, th.meta_title, th.meta_keywords, th.meta_des, th.disease_id]
        );
      }
      console.log(`Seeded ${initialTherapies.length} therapies.`);
    }

    // 5m. Create panchakarma_clinics table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS panchakarma_clinics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        map_url TEXT NULL,
        image VARCHAR(255) NULL,
        disease_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "panchakarma_clinics" checked/created.');

    // 5n. Create panchakarma_tags table (independent tag definitions)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS panchakarma_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "panchakarma_tags" checked/created.');

    // 5o. Create panchakarma_clinic_tags junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS panchakarma_clinic_tags (
        panchakarma_clinic_id INT NOT NULL,
        panchakarma_tag_id INT NOT NULL,
        PRIMARY KEY (panchakarma_clinic_id, panchakarma_tag_id),
        FOREIGN KEY (panchakarma_clinic_id) REFERENCES panchakarma_clinics(id) ON DELETE CASCADE,
        FOREIGN KEY (panchakarma_tag_id) REFERENCES panchakarma_tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "panchakarma_clinic_tags" checked/created.');

    // 5p. Seed panchakarma_tags if empty
    const [existingPanchTags] = await connection.query('SELECT * FROM panchakarma_tags LIMIT 1') as any[];
    if (existingPanchTags.length === 0) {
      console.log('Seeding initial panchakarma tags...');
      const initialPanchTags = [
        { name: 'Detoxification', slug: 'detoxification' },
        { name: 'Rejuvenation', slug: 'rejuvenation' },
        { name: 'Stress Relief', slug: 'stress-relief' }
      ];
      for (const pt of initialPanchTags) {
        await connection.query(
          'INSERT INTO panchakarma_tags (name, slug) VALUES (?, ?)',
          [pt.name, pt.slug]
        );
      }
      console.log(`Seeded ${initialPanchTags.length} panchakarma tags.`);
    }

    // 5q. Seed panchakarma_clinics if empty
    const [existingPanchClinics] = await connection.query('SELECT * FROM panchakarma_clinics LIMIT 1') as any[];
    if (existingPanchClinics.length === 0) {
      console.log('Seeding initial panchakarma clinics...');
      
      const [diseasesList] = (await connection.query('SELECT id, slug FROM diseases')) as any[];
      const getDiseaseIdBySlug = (slug: string) => {
        const match = diseasesList.find((d: any) => d.slug === slug);
        return match ? match.id : (diseasesList[0]?.id || null);
      };

      const initialPanchClinics = [
        {
          name: 'Karma Ayurveda Delhi Panchakarma Center',
          slug: 'delhi-panchakarma',
          address: 'Pocket 24, Sector 24, Rohini',
          city: 'Delhi',
          phone: '+91 99999 99999',
          email: 'delhi@karmaayurveda.com',
          map_url: 'https://maps.google.com',
          image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80',
          disease_id: getDiseaseIdBySlug('kidney-failure')
        },
        {
          name: 'Karma Ayurveda Mumbai Panchakarma Center',
          slug: 'mumbai-panchakarma',
          address: 'Bandra West, Link Road',
          city: 'Mumbai',
          phone: '+91 88888 88888',
          email: 'mumbai@karmaayurveda.com',
          map_url: 'https://maps.google.com',
          image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
          disease_id: getDiseaseIdBySlug('digestive-disorders')
        }
      ];

      for (const pc of initialPanchClinics) {
        await connection.query(
          `INSERT INTO panchakarma_clinics (name, slug, address, city, phone, email, map_url, image, disease_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [pc.name, pc.slug, pc.address, pc.city, pc.phone, pc.email, pc.map_url, pc.image, pc.disease_id]
        );
      }
      console.log(`Seeded ${initialPanchClinics.length} panchakarma clinics.`);
    }

    // 5r. Seed panchakarma_clinic_tags junction if empty
    const [existingJunction] = await connection.query('SELECT * FROM panchakarma_clinic_tags LIMIT 1') as any[];
    if (existingJunction.length === 0) {
      console.log('Seeding initial panchakarma clinic tag mappings...');
      const [clinicsList] = (await connection.query('SELECT id, slug FROM panchakarma_clinics')) as any[];
      const [tagsList] = (await connection.query('SELECT id, slug FROM panchakarma_tags')) as any[];

      const getClinicId = (slug: string) => clinicsList.find((c: any) => c.slug === slug)?.id;
      const getTagId = (slug: string) => tagsList.find((t: any) => t.slug === slug)?.id;

      const mappings = [
        { clinicSlug: 'delhi-panchakarma', tagSlug: 'detoxification' },
        { clinicSlug: 'delhi-panchakarma', tagSlug: 'rejuvenation' },
        { clinicSlug: 'mumbai-panchakarma', tagSlug: 'detoxification' },
        { clinicSlug: 'mumbai-panchakarma', tagSlug: 'stress-relief' }
      ];

      for (const m of mappings) {
        const cId = getClinicId(m.clinicSlug);
        const tId = getTagId(m.tagSlug);
        if (cId && tId) {
          await connection.query(
            'INSERT INTO panchakarma_clinic_tags (panchakarma_clinic_id, panchakarma_tag_id) VALUES (?, ?)',
            [cId, tId]
          );
        }
      }
      console.log('Seeded panchakarma clinic tags mappings.');
    }

    // 5s. Create cancer_clinics table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cancer_clinics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        map_url TEXT NULL,
        image VARCHAR(255) NULL,
        disease_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "cancer_clinics" checked/created.');

    // 5t. Create cancer_tags table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cancer_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "cancer_tags" checked/created.');

    // 5u. Create cancer_clinic_tags junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cancer_clinic_tags (
        cancer_clinic_id INT NOT NULL,
        cancer_tag_id INT NOT NULL,
        PRIMARY KEY (cancer_clinic_id, cancer_tag_id),
        FOREIGN KEY (cancer_clinic_id) REFERENCES cancer_clinics(id) ON DELETE CASCADE,
        FOREIGN KEY (cancer_tag_id) REFERENCES cancer_tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "cancer_clinic_tags" checked/created.');

    // 5v. Seed cancer_tags if empty
    const [existingCancerTags] = await connection.query('SELECT * FROM cancer_tags LIMIT 1') as any[];
    if (existingCancerTags.length === 0) {
      console.log('Seeding initial cancer tags...');
      const initialCancerTags = [
        { name: 'Immunotherapy', slug: 'immunotherapy' },
        { name: 'Chemotherapy Rehab', slug: 'chemotherapy-rehab' },
        { name: 'Palliative Care', slug: 'palliative-care' },
        { name: 'Targeted Therapy Support', slug: 'targeted-therapy-support' }
      ];
      for (const ct of initialCancerTags) {
        await connection.query(
          'INSERT INTO cancer_tags (name, slug) VALUES (?, ?)',
          [ct.name, ct.slug]
        );
      }
      console.log(`Seeded ${initialCancerTags.length} cancer tags.`);
    }

    // 5w. Seed cancer_clinics if empty
    const [existingCancerClinics] = await connection.query('SELECT * FROM cancer_clinics LIMIT 1') as any[];
    if (existingCancerClinics.length === 0) {
      console.log('Seeding initial cancer clinics...');
      
      const [diseasesList] = (await connection.query('SELECT id, slug FROM diseases')) as any[];
      const getDiseaseIdBySlug = (slug: string) => {
        const match = diseasesList.find((d: any) => d.slug === slug);
        return match ? match.id : (diseasesList[0]?.id || null);
      };

      const initialCancerClinics = [
        {
          name: 'Karma Ayurveda Delhi Cancer Care',
          slug: 'delhi-cancer-care',
          address: 'Building No. 12, Sector 8, Rohini',
          city: 'Delhi',
          phone: '+91 99999 77777',
          email: 'delhi.cancer@karmaayurveda.com',
          map_url: 'https://maps.google.com',
          image: 'https://images.unsplash.com/photo-1579684389782-64d84b5e905d?auto=format&fit=crop&w=800&q=80',
          disease_id: getDiseaseIdBySlug('cancer')
        },
        {
          name: 'Karma Ayurveda Mumbai Cancer Care',
          slug: 'mumbai-cancer-care',
          address: 'Andheri West, SV Road',
          city: 'Mumbai',
          phone: '+91 88888 77777',
          email: 'mumbai.cancer@karmaayurveda.com',
          map_url: 'https://maps.google.com',
          image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
          disease_id: getDiseaseIdBySlug('cancer')
        }
      ];

      for (const cc of initialCancerClinics) {
        await connection.query(
          `INSERT INTO cancer_clinics (name, slug, address, city, phone, email, map_url, image, disease_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [cc.name, cc.slug, cc.address, cc.city, cc.phone, cc.email, cc.map_url, cc.image, cc.disease_id]
        );
      }
      console.log(`Seeded ${initialCancerClinics.length} cancer clinics.`);
    }

    // 5x. Seed cancer_clinic_tags junction if empty
    const [existingCancerJunction] = await connection.query('SELECT * FROM cancer_clinic_tags LIMIT 1') as any[];
    if (existingCancerJunction.length === 0) {
      console.log('Seeding initial cancer clinic tag mappings...');
      const [clinicsList] = (await connection.query('SELECT id, slug FROM cancer_clinics')) as any[];
      const [tagsList] = (await connection.query('SELECT id, slug FROM cancer_tags')) as any[];

      const getClinicId = (slug: string) => clinicsList.find((c: any) => c.slug === slug)?.id;
      const getTagId = (slug: string) => tagsList.find((t: any) => t.slug === slug)?.id;

      const mappings = [
        { clinicSlug: 'delhi-cancer-care', tagSlug: 'immunotherapy' },
        { clinicSlug: 'delhi-cancer-care', tagSlug: 'palliative-care' },
        { clinicSlug: 'mumbai-cancer-care', tagSlug: 'chemotherapy-rehab' },
        { clinicSlug: 'mumbai-cancer-care', tagSlug: 'targeted-therapy-support' }
      ];

      for (const m of mappings) {
        const cId = getClinicId(m.clinicSlug);
        const tId = getTagId(m.tagSlug);
        if (cId && tId) {
          await connection.query(
            'INSERT INTO cancer_clinic_tags (cancer_clinic_id, cancer_tag_id) VALUES (?, ?)',
            [cId, tId]
          );
        }
      }
      console.log('Seeded cancer clinic tags mappings.');
    }

    // 5y. Create knee_clinics table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS knee_clinics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        map_url TEXT NULL,
        image VARCHAR(255) NULL,
        disease_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "knee_clinics" checked/created.');

    // 5z. Create knee_tags table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS knee_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "knee_tags" checked/created.');

    // 5aa. Create knee_clinic_tags junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS knee_clinic_tags (
        knee_clinic_id INT NOT NULL,
        knee_tag_id INT NOT NULL,
        PRIMARY KEY (knee_clinic_id, knee_tag_id),
        FOREIGN KEY (knee_clinic_id) REFERENCES knee_clinics(id) ON DELETE CASCADE,
        FOREIGN KEY (knee_tag_id) REFERENCES knee_tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "knee_clinic_tags" checked/created.');

    // 5ab. Seed knee_tags if empty
    const [existingKneeTags] = await connection.query('SELECT * FROM knee_tags LIMIT 1') as any[];
    if (existingKneeTags.length === 0) {
      console.log('Seeding initial knee tags...');
      const initialKneeTags = [
        { name: 'Osteoarthritis Rehab', slug: 'osteoarthritis-rehab' },
        { name: 'Joint Pain Therapy', slug: 'joint-pain-therapy' },
        { name: 'Therapeutic Massage', slug: 'therapeutic-massage' },
        { name: 'Janu Basti Specialist', slug: 'janu-basti-specialist' }
      ];
      for (const kt of initialKneeTags) {
        await connection.query(
          'INSERT INTO knee_tags (name, slug) VALUES (?, ?)',
          [kt.name, kt.slug]
        );
      }
      console.log(`Seeded ${initialKneeTags.length} knee tags.`);
    }

    // 5ac. Seed knee_clinics if empty
    const [existingKneeClinics] = await connection.query('SELECT * FROM knee_clinics LIMIT 1') as any[];
    if (existingKneeClinics.length === 0) {
      console.log('Seeding initial knee clinics...');
      
      const [diseasesList] = (await connection.query('SELECT id, slug FROM diseases')) as any[];
      const getDiseaseIdBySlug = (slug: string) => {
        const match = diseasesList.find((d: any) => d.slug === slug);
        return match ? match.id : (diseasesList[0]?.id || null);
      };

      const initialKneeClinics = [
        {
          name: 'Karma Ayurveda Delhi Knee Care',
          slug: 'delhi-knee-care',
          address: 'H-3, Sector 14, Rohini',
          city: 'Delhi',
          phone: '+91 99999 55555',
          email: 'delhi.knee@karmaayurveda.com',
          map_url: 'https://maps.google.com',
          image: 'https://images.unsplash.com/photo-1579684389782-64d84b5e905d?auto=format&fit=crop&w=800&q=80',
          disease_id: getDiseaseIdBySlug('joint-pain')
        },
        {
          name: 'Karma Ayurveda Mumbai Knee Care',
          slug: 'mumbai-knee-care',
          address: 'Andheri West, SV Road',
          city: 'Mumbai',
          phone: '+91 88888 55555',
          email: 'mumbai.knee@karmaayurveda.com',
          map_url: 'https://maps.google.com',
          image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
          disease_id: getDiseaseIdBySlug('joint-pain')
        }
      ];

      for (const kc of initialKneeClinics) {
        await connection.query(
          `INSERT INTO knee_clinics (name, slug, address, city, phone, email, map_url, image, disease_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [kc.name, kc.slug, kc.address, kc.city, kc.phone, kc.email, kc.map_url, kc.image, kc.disease_id]
        );
      }
      console.log(`Seeded ${initialKneeClinics.length} knee clinics.`);
    }

    // 5ad. Seed knee_clinic_tags junction if empty
    const [existingKneeJunction] = await connection.query('SELECT * FROM knee_clinic_tags LIMIT 1') as any[];
    if (existingKneeJunction.length === 0) {
      console.log('Seeding initial knee clinic tag mappings...');
      const [clinicsList] = (await connection.query('SELECT id, slug FROM knee_clinics')) as any[];
      const [tagsList] = (await connection.query('SELECT id, slug FROM knee_tags')) as any[];

      const getClinicId = (slug: string) => clinicsList.find((c: any) => c.slug === slug)?.id;
      const getTagId = (slug: string) => tagsList.find((t: any) => t.slug === slug)?.id;

      const mappings = [
        { clinicSlug: 'delhi-knee-care', tagSlug: 'osteoarthritis-rehab' },
        { clinicSlug: 'delhi-knee-care', tagSlug: 'janu-basti-specialist' },
        { clinicSlug: 'mumbai-knee-care', tagSlug: 'joint-pain-therapy' },
        { clinicSlug: 'mumbai-knee-care', tagSlug: 'therapeutic-massage' }
      ];

      for (const m of mappings) {
        const cId = getClinicId(m.clinicSlug);
        const tId = getTagId(m.tagSlug);
        if (cId && tId) {
          await connection.query(
            'INSERT INTO knee_clinic_tags (knee_clinic_id, knee_tag_id) VALUES (?, ?)',
            [cId, tId]
          );
        }
      }
      console.log('Seeded knee clinic tags mappings.');
    }

    // 5ae. Create awards table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS awards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        date VARCHAR(100) NOT NULL,
        sorting INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "awards" checked/created.');

    // 5af. Seed awards if empty
    const [existingAwards] = await connection.query('SELECT * FROM awards LIMIT 1') as any[];
    if (existingAwards.length === 0) {
      console.log('Seeding initial awards...');
      const initialAwards = [
        {
          title: 'Best Ayurvedic Hospital 2024',
          image: 'https://images.unsplash.com/photo-1579684389782-64d84b5e905d?auto=format&fit=crop&w=400&q=80',
          date: 'January 2024',
          sorting: 1
        },
        {
          title: 'Excellence in Renal Care & Research',
          image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
          date: 'November 2023',
          sorting: 2
        },
        {
          title: 'Pioneer in Ayurvedic Therapeutics Award',
          image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80',
          date: 'September 2023',
          sorting: 3
        }
      ];
      for (const aw of initialAwards) {
        await connection.query(
          'INSERT INTO awards (title, image, date, sorting) VALUES (?, ?, ?, ?)',
          [aw.title, aw.image, aw.date, aw.sorting]
        );
      }
      console.log(`Seeded ${initialAwards.length} awards.`);
    }

    // 5ag. Create site_faq table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_faq (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sorting INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "site_faq" checked/created.');

    // 5ah. Seed site_faq if empty
    const [existingFaqs] = await connection.query('SELECT * FROM site_faq LIMIT 1') as any[];
    if (existingFaqs.length === 0) {
      console.log('Seeding initial site FAQs...');
      const initialFaqs = [
        {
          question: 'What is Ayurveda?',
          answer: 'Ayurveda is a 5,000-year-old system of natural healing that has its origins in the Vedic culture of India. It focuses on balance, diet, herbal treatment, and yogic breathing.',
          sorting: 1
        },
        {
          question: 'How long does kidney treatment take in Ayurveda?',
          answer: 'The duration of Ayurvedic kidney treatment depends on the severity of the disease and individual response to therapy. Generally, patients notice improvements within a few months of disciplined diet and medicines.',
          sorting: 2
        },
        {
          question: 'Are there any side effects of Ayurvedic medicines?',
          answer: 'Ayurvedic medicines are formulated from natural herbs and minerals. When taken under the guidance of a qualified Ayurvedic practitioner, they are highly safe and free from toxic side effects.',
          sorting: 3
        }
      ];
      for (const faq of initialFaqs) {
        await connection.query(
          'INSERT INTO site_faq (question, answer, sorting) VALUES (?, ?, ?)',
          [faq.question, faq.answer, faq.sorting]
        );
      }
      console.log(`Seeded ${initialFaqs.length} site FAQs.`);
    }

    // 5ai. Create media_articles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS media_articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        article_link VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        sort INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "media_articles" checked/created.');

    // 5aj. Seed media_articles if empty
    const [existingMediaArticles] = await connection.query('SELECT * FROM media_articles LIMIT 1') as any[];
    if (existingMediaArticles.length === 0) {
      console.log('Seeding initial media articles...');
      const initialArticles = [
        {
          title: 'Karma Ayurveda Recognized for Breakthrough in Kidney Care',
          article_link: 'https://timesofindia.indiatimes.com',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80',
          sort: 1
        },
        {
          title: 'The Future of Ayurvedic Medicine: A Deep Dive with Dr. Dhawan',
          article_link: 'https://www.hindustantimes.com',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
          sort: 2
        }
      ];
      for (const article of initialArticles) {
        await connection.query(
          'INSERT INTO media_articles (title, article_link, image, sort) VALUES (?, ?, ?, ?)',
          [article.title, article.article_link, article.image, article.sort]
        );
      }
      console.log(`Seeded ${initialArticles.length} media articles.`);
    }

    // Create research_articles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS research_articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        link VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        sort INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "research_articles" checked/created.');

    // Create courses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        link VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        sort INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "courses" checked/created.');

    // 5ak. Create pages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "pages" checked/created.');

    // 5al. Seed pages if empty
    const [existingPages] = await connection.query('SELECT * FROM pages LIMIT 1') as any[];
    if (existingPages.length === 0) {
      console.log('Seeding initial pages...');
      const initialPages = [
        {
          name: 'Terms & Conditions',
          slug: 'terms-and-conditions',
          description: '<h1>Terms & Conditions</h1><p>Welcome to Karma Ayurveda. By accessing this website, you agree to comply with and be bound by these terms and conditions...</p>'
        },
        {
          name: 'Privacy Policy',
          slug: 'privacy-policy',
          description: '<h1>Privacy Policy</h1><p>Your privacy is extremely important to us. This policy describes how we collect, use, and protect your personal information...</p>'
        },
        {
          name: 'Disclaimer',
          slug: 'disclaimer',
          description: '<h1>Disclaimer</h1><p>The information on this site is not intended or implied to be a substitute for professional medical advice, diagnosis or treatment...</p>'
        },
        {
          name: 'Cancellation & Refund',
          slug: 'cancellation-refund',
          description: '<h1>Cancellation & Refund Policy</h1><p>Please read our policy regarding cancellation of appointments and refund processing conditions...</p>'
        },
        {
          name: 'Return Policy',
          slug: 'return-policy',
          description: '<h1>Return Policy</h1><p>Products ordered through our portal can be returned within the specified period if they meet the return criteria...</p>'
        }
      ];
      for (const page of initialPages) {
        await connection.query(
          'INSERT INTO pages (name, slug, description) VALUES (?, ?, ?)',
          [page.name, page.slug, page.description]
        );
      }
      console.log(`Seeded ${initialPages.length} pages.`);
    }

    // 5am. Create site_profile table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_profile (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo VARCHAR(255) NOT NULL,
        favicon VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        us_phone VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        x_link VARCHAR(255) NULL,
        fb_link VARCHAR(255) NULL,
        ig_link VARCHAR(255) NULL,
        yt_link VARCHAR(255) NULL,
        wa_number VARCHAR(50) NULL,
        wa_channel VARCHAR(255) NULL,
        nabh_logo VARCHAR(255) NULL,
        nabh_cert_num VARCHAR(100) NULL,
        nabh_duration VARCHAR(100) NULL,
        total_hospitals INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "site_profile" checked/created.');

    // 5an. Seed site_profile if empty
    const [existingProfiles] = await connection.query('SELECT * FROM site_profile LIMIT 1') as any[];
    if (existingProfiles.length === 0) {
      console.log('Seeding default site profile...');
      await connection.query(`
        INSERT INTO site_profile (
          name, logo, favicon, email, phone, us_phone, address,
          x_link, fb_link, ig_link, yt_link, wa_number, wa_channel,
          nabh_logo, nabh_cert_num, nabh_duration, total_hospitals
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Karma Ayurveda',
        'https://www.karmaayurveda.com/new/assets/image/logo.png',
        '/favicon.ico',
        'info@karmaayurveda.com',
        '+91 99999 99999',
        '+1 (800) 555-0199',
        'Pocket 24, Sector 24, Rohini, New Delhi, Delhi 110085',
        'https://x.com/karmaayurveda',
        'https://facebook.com/karmaayurveda',
        'https://instagram.com/karmaayurveda',
        'https://youtube.com/karmaayurveda',
        '+91 99999 99999',
        'https://whatsapp.com/channel/karmaayurveda',
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=200&q=80',
        'NABH/CERT/1937',
        '3 Years (Valid till Dec 2027)',
        10
      ]);
      console.log('Seeded default site profile.');
    }

    // 5ao. Create pillars table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pillars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pillar_key VARCHAR(100) NOT NULL UNIQUE,
        number VARCHAR(10) NOT NULL,
        name VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) NOT NULL,
        badge VARCHAR(100) NOT NULL,
        icon VARCHAR(100) NOT NULL DEFAULT 'Sparkles',
        image VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        categories TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "pillars" checked/created.');

    // 5ap. Seed pillars if empty (mirrors the four-pillar "How We Reverse Diseases" content)
    const [existingPillars] = await connection.query('SELECT * FROM pillars LIMIT 1') as any[];
    if (existingPillars.length === 0) {
      console.log('Seeding initial pillars...');

      const initialPillars = [
        {
          pillar_key: 'shodhan',
          number: '01',
          name: 'Shodhan',
          subtitle: 'Cleansing & Detoxification',
          badge: 'Therapies',
          icon: 'Sparkles',
          image: 'https://hiims.in/images-new/pillar1.webp',
          description: 'Shodhan focuses on eliminating deeply rooted toxins (Ama) and structural blockages from the body tissues to restore natural equilibrium.',
          sort_order: 1,
          categories: JSON.stringify([
            {
              title: 'Panchakarma (Five Core Detox Actions)',
              subtitle: 'The ultimate Ayurvedic detoxification system to purge morbid doshas from the body.',
              therapies: [
                {
                  id: 'vamana',
                  name: 'Vamana',
                  what: 'Vamana is a therapeutic process from Panchakarma that helps remove toxins from the internal upper body.',
                  how: 'The process involves herbal preparations that gently induce vomiting to cleanse the digestive and thoracic tract.',
                  why: 'It removes excess Kapha, mucus, and toxins accumulated in the stomach and chest, improving digestion and respiration.',
                  benefits: 'Respiratory Relief, Digestive Improvement, Better Skin Health, Improved Mental Clarity, and Strong Immunity.',
                  image: 'https://hiims.in/images-new/vamana.webp'
                },
                {
                  id: 'virechana',
                  name: 'Virechana',
                  what: 'Virechana is a medicated purgation therapy that purifies the liver, gallbladder, and digestive tract.',
                  how: 'Specialized herbal formulations are administered to flush out bile pigments and accumulated Pitta toxins through bowel evacuation.',
                  why: 'It eliminates excess heat, acidity, and toxic bile buildup in the liver, blood vessels, and digestive organs.',
                  benefits: 'Liver Detoxification, Natural Skin Glow, Relief from Acid Reflux, Metabolic Balance, and Improved Digestive Agni.',
                  image: 'https://hiims.in/images-new/virechana.webp'
                },
                {
                  id: 'basti',
                  name: 'Basti',
                  what: 'Basti is a medicated enema therapy considered the most effective Panchakarma treatment for Vata disorders.',
                  how: 'Customized herbal oils and decoctions are introduced into the colon to purge toxins and nourish deep tissues.',
                  why: 'It targets the colon—the primary seat of Vata—to eliminate stubborn systemic waste and joint stiffness.',
                  benefits: 'Joint Pain Relief, Chronic Constipation Relief, Kidney & Colon Detoxification, Calm Nervous System.',
                  image: 'https://hiims.in/images-new/basti.webp'
                },
                {
                  id: 'nasya',
                  name: 'Nasya',
                  what: 'Nasya is the administration of medicated herbal drops or oils through the nasal passages.',
                  how: 'After gentle facial steam and massage, herbal extracts are instilled into nostrils to reach cranial channels.',
                  why: 'It clears head, sinus, and neck blockages, enhancing oxygen supply to brain cells and sensory organs.',
                  benefits: 'Sinus & Migraine Relief, Enhanced Memory & Focus, Reduced Hair Fall, Clear Vision, Mental Calm.',
                  image: 'https://hiims.in/images-new/nasya.webp'
                },
                {
                  id: 'raktamokshana',
                  name: 'Raktamokshana',
                  what: 'Raktamokshana is a specialized blood-purification therapy using sterile medicinal leeches (Jalauka).',
                  how: 'Medicinal leeches extract localized stagnant blood while releasing anti-inflammatory enzymes into micro-vessels.',
                  why: 'It purges toxic blood (Rakta Dhatu) to rapidly reduce localized swelling, joint pain, and chronic skin lesions.',
                  benefits: 'Psoriasis & Eczema Relief, Reduced Swelling, Varicose Vein Healing, Improved Micro-Circulation.',
                  image: 'https://hiims.in/images-new/raktamokshana.webp'
                }
              ]
            },
            {
              title: 'Naturopathy Therapies',
              subtitle: 'Advanced nature-cure therapies to stimulate circulation, sweating, and organ recovery.',
              therapies: [
                {
                  id: 'hwi',
                  name: 'Hot Water Immersion (HWI)',
                  what: 'Controlled thermal water bath therapy at 42°C engineered to reduce strain on kidneys and heart.',
                  how: 'Warm water immersion creates hydrostatic pressure that redistributes blood volume and activates sweat pores.',
                  why: 'It induces profuse sweating to excrete urea and creatinine through the skin, reducing renal workload.',
                  benefits: 'Creatinine Reduction, Blood Pressure Regulation, Systemic Detox, Edema & Swelling Relief.',
                  image: 'https://hiims.in/images-new/hot-water-therapy.webp'
                },
                {
                  id: 'gravity',
                  name: 'Gravity As Medicine (Gradient Therapy)',
                  what: 'Postural positioning therapy utilizing Earth gravity to redirect blood flow to vital organs.',
                  how: 'A 10° head-down tilt position shifts blood from lower extremities toward the torso, heart, and kidneys.',
                  why: 'Increases renal blood flow and Glomerular Filtration Rate (GFR) naturally without chemical drugs.',
                  benefits: 'Improved GFR Score, Enhanced Kidney Perfusion, Reduced Leg Swelling, Controlled BP.',
                  image: 'https://hiims.in/images-new/gravity-as-medicine.webp'
                },
                {
                  id: 'zero-volt',
                  name: 'Zero-Volt Earthing / Grounding',
                  what: 'Direct physical connection between the human body and the Earth’s natural electric field.',
                  how: 'Patients rest on conductive grounding sheets connected directly to a copper Earth grounding rod.',
                  why: 'Earth free electrons neutralize positively charged free radicals and systemic tissue inflammation.',
                  benefits: 'Reduced Chronic Inflammation, Deep Sleep Restoration, Normal Blood Viscosity, Rapid Recovery.',
                  image: 'https://hiims.in/images-new/zero-volt-therapy.webp'
                }
              ]
            }
          ])
        },
        {
          pillar_key: 'aahar',
          number: '02',
          name: 'Aahar',
          subtitle: 'Healing Through Food',
          badge: 'Nutrition',
          icon: 'Leaf',
          image: 'https://hiims.in/images-new/pillar4.webp',
          description: 'Food is considered the primary medicine in Ayurveda. Aahar corrects Agni (digestive fire) and feeds cellular regeneration.',
          sort_order: 2,
          categories: JSON.stringify([
            {
              title: 'Dietary & Cellular Cleanse',
              subtitle: 'Customized living food plans designed to alkalize and repair the internal environment.',
              therapies: [
                {
                  id: 'dip-diet',
                  name: 'DIP & pH-Balanced Living Diet',
                  what: 'A structured nutritional protocol centered around raw living fruits, seasonal greens, and plant-based foods.',
                  how: 'Consuming high-water content raw foods in specific ratios optimizes stomach acid and systemic pH levels.',
                  why: 'Replaces processed acidic waste with living enzymes, unburdening digestive and excretory organs.',
                  benefits: 'Natural Blood Sugar Control, Reversed Acidity, High Energy Levels, Gut Microbiome Repair.',
                  image: 'https://hiims.in/images-new/pillar4.webp'
                },
                {
                  id: 'fasting',
                  name: 'Autophagy & Intermittent Fasting',
                  what: 'Regulated eating windows that activate the body’s innate self-cleansing mechanisms.',
                  how: 'Fasting for 14-16 hours prompts white blood cells to recycle damaged cellular organelles and protein buildup.',
                  why: 'Triggers cellular autophagy, allowing damaged tissues in kidneys and liver to repair naturally.',
                  benefits: 'Cellular Renewal, Reduced Insulin Resistance, Autophagy Activation, Weight Management.',
                  image: 'https://hiims.in/images-new/pillar4.webp'
                }
              ]
            }
          ])
        },
        {
          pillar_key: 'vihar',
          number: '03',
          name: 'Vihar',
          subtitle: 'Lifestyle & Mind-Body Sync',
          badge: 'Lifestyle',
          icon: 'Sun',
          image: 'https://hiims.in/images-new/pillar3.webp',
          description: 'Aligning daily habits with biological circadian rhythms to manage stress, balance hormones, and sustain vitality.',
          sort_order: 3,
          categories: JSON.stringify([
            {
              title: 'Circadian Alignment & Yoga',
              subtitle: 'Integrating mental peace and physical movement for complete organ rejuvenation.',
              therapies: [
                {
                  id: 'sunlight-grounding',
                  name: 'Sunlight Therapy & Morning Routine',
                  what: 'Direct morning sun exposure and barefoot nature walking to sync biological rhythms.',
                  how: 'Morning infrared and UV light stimulates pineal gland melatonin synthesis and Vitamin D production.',
                  why: 'Restores natural sleep-wake cycles, balances cortisol, and reduces systemic oxidative stress.',
                  benefits: 'Improved Sleep Quality, Balanced Hormones, Stronger Immunity, Elevated Mood.',
                  image: 'https://hiims.in/images-new/pillar3.webp'
                },
                {
                  id: 'yoga-pranayama',
                  name: 'Therapeutic Yoga & Pranayama',
                  what: 'Targeted organ-specific asanas and deep oxygenation breathing exercises.',
                  how: 'Pranayama routines increase cellular oxygenation while gentle postures massage internal organs.',
                  why: 'Stimulates parasympathetic nervous system, lowering blood pressure and enhancing kidney circulation.',
                  benefits: 'Enhanced Oxygenation, Lower Stress Hormones, Organ Massaging, Improved Flexibility.',
                  image: 'https://hiims.in/images-new/pillar3.webp'
                }
              ]
            }
          ])
        },
        {
          pillar_key: 'shaman',
          number: '04',
          name: 'Shaman',
          subtitle: 'Herbal Rejuvenation & Healing',
          badge: 'Medicines',
          icon: 'Activity',
          image: 'https://hiims.in/images-new/pillar2.webp',
          description: 'Using specialized Ayurvedic herbs and Rasayana remedies to soothe aggravated doshas and strengthen organ vitality.',
          sort_order: 4,
          categories: JSON.stringify([
            {
              title: 'Botanical Formulations',
              subtitle: 'Pure, standardized herbal preparations targeting root-cause disease reversal.',
              therapies: [
                {
                  id: 'ayurvedic-herbs',
                  name: 'Customized Kidney & Liver Herbs',
                  what: 'Pure botanical formulations containing Punarnava, Gokshura, Varun, and Guduchi.',
                  how: 'Bioactive herbal compounds reduce cellular inflammation and promote nephron and hepatocyte regeneration.',
                  why: 'Targets the root cause of organ decline without synthetic chemicals or toxic side effects.',
                  benefits: 'Creatinine Control, Liver Enzyme Normalization, Kidney Tissue Repair, Natural Detox.',
                  image: 'https://hiims.in/images-new/pillar2.webp'
                },
                {
                  id: 'rasayana',
                  name: 'Rasayana Therapy (Tissue Rejuvenation)',
                  what: 'Nourishing herbal remedies that rebuild body tissues (Dhatus) and immunity.',
                  how: 'Potent Rasayana preparations fortify cellular membranes and improve nutrient absorption.',
                  why: 'Prevents disease recurrence and builds long-term vitality in patients recovering from chronic illness.',
                  benefits: 'Relapse Prevention, Enhanced Immunity, Youthful Vitality, Stronger Metabolism.',
                  image: 'https://hiims.in/images-new/pillar2.webp'
                }
              ]
            }
          ])
        }
      ];

      for (const p of initialPillars) {
        await connection.query(
          `INSERT INTO pillars (pillar_key, number, name, subtitle, badge, icon, image, description, categories, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.pillar_key, p.number, p.name, p.subtitle, p.badge, p.icon, p.image, p.description, p.categories, p.sort_order]
        );
      }
      console.log(`Seeded ${initialPillars.length} pillars.`);
    }

    // 5aq. Create disease_pillars junction table (which reversal pillars show on which disease page)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS disease_pillars (
        disease_id INT NOT NULL,
        pillar_id INT NOT NULL,
        PRIMARY KEY (disease_id, pillar_id),
        FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE,
        FOREIGN KEY (pillar_id) REFERENCES pillars(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "disease_pillars" checked/created.');

    // 5ar. Backfill disease_pillars if empty: link every existing disease to every existing pillar
    // (preserves current behavior where every disease page shows all pillars)
    const [existingDiseasePillars] = await connection.query('SELECT * FROM disease_pillars LIMIT 1') as any[];
    if (existingDiseasePillars.length === 0) {
      console.log('Backfilling disease_pillars links...');
      const [allDiseases] = await connection.query('SELECT id FROM diseases') as any[];
      const [allPillars] = await connection.query('SELECT id FROM pillars') as any[];
      let linkCount = 0;
      for (const dis of allDiseases) {
        for (const pil of allPillars) {
          await connection.query(
            'INSERT IGNORE INTO disease_pillars (disease_id, pillar_id) VALUES (?, ?)',
            [dis.id, pil.id]
          );
          linkCount++;
        }
      }
      console.log(`Backfilled ${linkCount} disease-pillar links.`);
    }

    // 6. Seed default admin if not exists
    const [admins] = await connection.query('SELECT * FROM admins LIMIT 1') as any[];
    if (admins.length === 0) {
      const defaultUsername = 'admin';
      const defaultPassword = 'admin123';
      const pwHash = hashPassword(defaultPassword);
      await connection.query(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        [defaultUsername, pwHash]
      );
      console.log(`Seeded default admin user: Username = "${defaultUsername}", Password = "${defaultPassword}"`);
    }

    // 7. Seed blog posts if table is empty
    const [blogs] = await connection.query('SELECT * FROM blogs LIMIT 1') as any[];
    if (blogs.length === 0) {
      console.log('Seeding initial blogs from blogData.ts...');
      for (const post of blogPosts) {
        await connection.query(
          `INSERT INTO blogs (slug, title, excerpt, content, author, date, image, category, meta_title, meta_keywords, meta_des) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            post.slug, 
            post.title, 
            post.excerpt, 
            post.content, 
            post.author, 
            post.date, 
            post.image, 
            post.category,
            post.title,
            post.category.toLowerCase() + ', ayurveda, ' + post.author.toLowerCase(),
            post.excerpt
          ]
        );
      }
      console.log(`Seeded ${blogPosts.length} blog posts into the database.`);
    }

    // Create web_stories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS web_stories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        meta_title VARCHAR(255) NULL,
        meta_des TEXT NULL,
        meta_keywords VARCHAR(500) NULL,
        cover_image VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "web_stories" checked/created.');

    // Create web_story_panels table (dynamic "Add New Panel" list, full-replace pattern on save)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS web_story_panels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        story_id INT NOT NULL,
        image VARCHAR(500) NULL,
        heading VARCHAR(255) NULL,
        paragraph TEXT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (story_id) REFERENCES web_stories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table "web_story_panels" checked/created.');

    // Backfill empty meta columns for existing blogs
    await connection.query(`
      UPDATE blogs 
      SET meta_title = COALESCE(meta_title, title), 
          meta_keywords = COALESCE(meta_keywords, CONCAT(category, ', ayurveda, ', author)), 
          meta_des = COALESCE(meta_des, excerpt) 
      WHERE meta_title IS NULL OR meta_title = ''
    `);

    // Backfill empty meta columns for existing diseases
    await connection.query(`
      UPDATE diseases 
      SET meta_title = COALESCE(meta_title, CONCAT(name, ' Treatment')), 
          meta_keywords = COALESCE(meta_keywords, CONCAT(name, ', treatment, ayurveda, healing')), 
          meta_des = COALESCE(meta_des, description) 
      WHERE meta_title IS NULL OR meta_title = ''
    `);

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
