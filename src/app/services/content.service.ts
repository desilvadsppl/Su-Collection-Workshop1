import {Injectable, signal} from '@angular/core';
import {db} from '../../lib/firebase';
import {doc, onSnapshot, setDoc} from 'firebase/firestore';

export interface WebsiteContent {
  app: {
    footerBrand: string;
    footerCopy: string;
    navHome: string;
    navCourses: string;
    navCustom: string;
    navShop: string;
    navAbout: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    branch?: string;
    whatsappNumber?: string;
    whatsappDisplay?: string;
  };
  home: {
    heroTitle: string;
    heroDesc: string;
    heroDesc2: string;
    stat1: string; stat1Label: string;
    stat2: string; stat2Label: string;
    stat3: string; stat3Label: string;
    meetTitle: string;
    meetDesc: string;
    meetBtn: string;
    videoTitle: string;
    videoDesc: string;
    servicesTitle: string;
    servicesDesc: string;
    howItWorksTitle: string;
    howItWorksStep1Title: string;
    howItWorksStep1: string;
    howItWorksStep2Title: string;
    howItWorksStep2: string;
    howItWorksStep3Title: string;
    howItWorksStep3: string;
    howItWorksStep4Title: string;
    howItWorksStep4: string;
    howItWorksStep5Title: string;
    howItWorksStep5: string;
    bento1Title: string;
    bento1Desc: string;
    bento1Btn: string;
    bento2Title: string;
    bento2Desc: string;
    bento2Btn: string;
    bento3Title: string;
    bento3Desc: string;
    bento3Btn: string;
    testimonialQuote: string;
    ctaTitle: string;
    ctaDesc: string;
    ctaBtn1: string;
    ctaBtn2: string;
  };
  learn: {
    heroTitle: string;
    heroDesc: string;
    whyTitle: string;
    whyDesc: string;
    mainCoursePill: string;
    mainCourseTitle: string;
    mainCourseDesc: string;
    mainCourseBtn1: string;
    mainCourseBtn2: string;
    allClassesTitle: string;
  };
  sewAndSu: {
    heroTitle: string;
    heroDesc: string;
    processTitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    formTitle: string;
  };
  shop: {
    heroTitle: string;
    heroDesc: string;
  };
  about: {
    heroPill: string;
    heroTitle: string;
    heroDesc: string;
    content: string;
  };
  contact: {
    heroTitle: string;
    heroDesc: string;
    whatsappTitle: string;
    whatsappDesc: string;
    whatsappBtn: string;
    formTitle: string;
  };
  dedicatedCourses: Record<string, {
    pill: string;
    subtitle: string;
    title: string;
    price: string;
    mainDesc: string;
    subDesc: string;
    bulletTitle: string;
    bullet1Title: string;
    bullet1Desc: string;
    bullet2Title: string;
    bullet2Desc: string;
    bullet3Title: string;
    bullet3Desc: string;
    bullet4Title: string;
    bullet4Desc: string;
    bullet5Title?: string;
    bullet5Desc?: string;
    bullet6Title?: string;
    bullet6Desc?: string;
    bullet7Title?: string;
    bullet7Desc?: string;
    bottomDescExtra: string;
    bottomTitle1: string;
    bottomDesc1: string;
    bottomTitle2: string;
    bottomDesc2: string;
  }>;
}


export const defaultContent: WebsiteContent = {
  app: {
    footerBrand: "Sri Lanka's leading academy for master dressmaking, mentorship, and bespoke tailoring.",
    footerCopy: "© 2024 Su Collection. All rights reserved.",
    navHome: "Home",
    navCourses: "Our Services & Products",
    navCustom: "Custom Sewing",
    navShop: "Shop",
    navAbout: "About Us",
    bankName: "Seylan Bank PLC",
    accountName: "The UVA VEC (Private) Limited",
    accountNumber: "11201 39276 64001",
    branch: "Godagama",
    whatsappNumber: "94769269586",
    whatsappDisplay: "+94 76 926 9586"
  },
  home: {
    heroTitle: "ඔබේ මැහුම් හැකියාවෙන් සාර්ථක ව්යාපාරයක් ගොඩනගමු!",
    heroDesc: "Stop guessing with confusing patterns. Master dressmaking, perfect garment fitting, and pattern drafting with Swarna Herath—backed by 30 years of real workshop experience and 150,000+ social followers across Sri Lanka.",
    heroDesc2: "Join thousands of women who have turned their passion for sewing into profitable home-based businesses under Swarna's expert guidance.",
    stat1: "30+", stat1Label: "Years Master Tailoring",
    stat2: "150k+", stat2Label: "TikTok & FB Followers",
    stat3: "1-on-1", stat3Label: "Personal WhatsApp Mentorship",
    meetTitle: "Meet Swarna Herath",
    meetDesc: "වසර 30කට වැඩි කාලයක් පුරා විලාසිතා නිර්මාණකරණයේ නියැලෙමින්, කාන්තාවන් සිය ගණනකට සාර්ථක නිවෙස් පදනම් කරගත් විලාසිතා ව්‍යාපාර ආරම්භ කිරීමට මඟපෙන්වූ ප්‍රවීණ අත්දැකීම්.",
    meetBtn: "Read Swarna's Story",
    videoTitle: "Watch Swarna in Action",
    videoDesc: "150,000 කට අධික අපගේ සමාජ මාධ්‍ය ප්‍රජාව වෙත ගෙන එන ප්‍රායෝගික මැහුම් රහස්, කෙටි ක්‍රමවේද (Pattern secrets) සහ අපගේ සිසුන්ගේ සාර්ථකත්වයේ කතන්දර මෙතැනින් නරඹන්න.",
    servicesTitle: "Our Services & Products",
    servicesDesc: "පුද්ගලික මඟපෙන්වීම් (1-on-1 coaching) ලබාගැනීමට හෝ PDF අත්පොත් (Guides) ඇණවුම් කිරීමට පහතින් තෝරාගන්න. සියලුම ගනුදෙනු සහ බැංකු තැන්පතු තහවුරු කිරීම් WhatsApp හරහා ඉතා ආරක්ෂිතව සිදු කෙරේ.",
    howItWorksTitle: "WhatsApp හරහා මුදල් ගෙවා ඇණවුම් කරන ආකාරය",
    howItWorksStep1Title: "Pick Your Guide",
    howItWorksStep1: "පහතින් ඇති සේවාවන් හෝ PDF අත්පොත් වලින් ඔබට අවශ්ය දේ තෝරාගන්න.",
    howItWorksStep2Title: 'Click "Order on WhatsApp"',
    howItWorksStep2: "එය ක්ලික් කළ විගස, බැංකු විස්තර ඉල්ලා අපගේ නිල WhatsApp අංකයට ස්වයංක්රීයව පණිවිඩයක් යොමු වේ.",
    howItWorksStep3Title: "Transfer & Send Slip",
    howItWorksStep3: "ඔබගේ බැංකු යෙදුමකින් (App එකකින්) හෝ බැංකුව හරහා මුදල් තැන්පත් කර, එම රිසිට්පතෙහි ඡායාරූපයක් අපට එවන්න.",
    howItWorksStep4Title: "Instant Verification",
    howItWorksStep4: "අපගේ කණ්ඩායම ඔබගේ රිසිට්පත පරීක්ෂා කර තහවුරු කළ වහාම, අදාළ PDF අත්පොත එවීමට හෝ පන්ති වේලාවන් වෙන් කිරීමට කටයුතු කරනු ඇත.",
    howItWorksStep5Title: "Start Learning",
    howItWorksStep5: "ඔබට අදාළ PDF ගොනු හෝ පන්ති සබැඳි (Links) WhatsApp හරහාම ලැබෙනු ඇත. දැන් ඔබේ මැහුම් ගමන අරඹන්න!",
    bento1Title: "Mentorship & Cutting Guides",
    bento1Desc: "Step-by-step masterclasses, downloadable PDF pattern blueprints, and direct WhatsApp voice feedback.",
    bento1Btn: "Explore Programs",
    bento2Title: "Custom Made-to-Measure Outfits",
    bento2Desc: "Send us a design photo. We calculate your custom measurements, source the finest fabrics, and tailor a flawless piece.",
    bento2Btn: "Inquire on WhatsApp",
    bento3Title: "Curated Tailoring Tools",
    bento3Desc: "The exact Japanese shears, rotary cutters, and presser feet Swarna uses every single day in her studio.",
    bento3Btn: "Browse Tools",
    testimonialQuote: `"මාස ගාණක් තිස්සේ YouTube එකේ එක එක Tutorials බල බල හිටියත්, මට හරියටම ඕනේ දේ ඉගෙනගන්න බැරි වුණා. ස්වර්ණා මිස්ගේ <strong>Guidance එකත් එක්ක සති 3ක් යද්දි, Armhole එකේ එක රැල්ලක්වත් නැතුව මගේ පළවෙනි Princess-Line Frock එක හරියටම Cut කරගන්න මට පුළුවන් වුණා!</strong>"`,
    ctaTitle: "Ready to Create Your Own Fashion?",
    ctaDesc: "Whether you want to stitch your own wardrobe, get personal mentorship, or order custom tailoring, we are here on WhatsApp.",
    ctaBtn1: "View Mentorship & Guides",
    ctaBtn2: "Message on WhatsApp"
  },
  learn: {
    heroTitle: "Sewing Classes",
    heroDesc: "Learn to sew your own clothes or start a tailoring business. Step-by-step guidance for beginners and advanced students.",
    whyTitle: "Why Learn With Us?",
    whyDesc: "Stop struggling with complicated paper patterns. Learn how to look at a design, understand how it's made, and sew it perfectly for any body shape.",
    mainCoursePill: "Main Course",
    mainCourseTitle: "Complete Sewing & Business Masterclass",
    mainCourseDesc: "Learn everything from basic stitching to running a successful tailoring business. Swarna will personally guide you to master dressmaking and find your unique style.",
    mainCourseBtn1: "Join the Class",
    mainCourseBtn2: "View Details",
    allClassesTitle: "All Classes"
  },
  sewAndSu: {
    heroTitle: "Custom Made Dresses & Outfits",
    heroDesc: "Send us a picture of the dress you want. We will take your measurements online, choose the right fabric, and sew an outfit that fits you perfectly.",
    processTitle: "How It Works",
    step1Title: "Consultation",
    step1Desc: "Send us a photo of the dress. We’ll discuss the right fabrics, the perfect fit for you, and give you a price.",
    step2Title: "Measurements",
    step2Desc: "We’ll show you exactly how to take your measurements at home. Pay a small deposit to get started.",
    step3Title: "Production",
    step3Desc: "We sew your outfit and deliver it straight to your door, anywhere in the country.",
    formTitle: "Start Your Order"
  },
  shop: {
    heroTitle: "Sewing Tools & Accessories",
    heroDesc: "High-quality sewing tools, machine parts, and scissors—handpicked and trusted by Swarna for her own work."
  },
  about: {
    heroPill: "Meet Swarna Herath",
    heroTitle: "Swarna's Story",
    heroDesc: "Over 30 years of crafting beautiful dresses with love. A lifelong journey and passion for teaching others the art of sewing.",
    content: `අවුරුදු <strong>30කට වැඩි කාලයක්</strong> තිස්සේ මැහුම් කලාවත් එක්ක ගත කරපු ගමනක් තමයි අද <strong>Su Collection</strong> කියන්නේ. මුලින් මැහුම් ගැන තිබුණු ආසාවත් එක්ක පොඩියට පටන්ගත්ත මේ ගමන, අද වෙනකොට දහස් ගණනකට ලස්සනට, නිවැරදිව ඇඳුම් මහන්න ඉගෙනගන්න පුළුවන් තැනක් වෙලා තියෙනවා.

<strong>“මැහුම් ඉගෙනගන්න ගොඩක් අය කරන ලොකුම වැරැද්ද තමයි, පතරොමක් බලාගෙන ඒ විදිහටම මහන්න පුළුවන් වුණාම මැහුම් දන්නවා කියලා හිතන එක.”</strong>

ඇත්තටම මැහුම් කියන්නේ ඒක විතරක් නෙවෙයි.

Design එකක් දැක්කාම ඒක හැදිලා තියෙන්නේ කොහොමද කියලා තේරුම්ගන්න, ඒකට ගැළපෙන Pattern එක හදාගන්න, නිවැරදිව Cut කරගන්න, අන්තිමේදී ඒ ඇඳුම අඳින කෙනාගේ ඇඟට ලස්සනට Fit වෙන විදිහට නිම කරන්න දැනගන්න ඕනේ.

<strong>Su Collection එකේ අපි උගන්වන්නේ ඒ Skill එක.</strong>

අද වෙනකොට Social Media හරහා <strong>150,000කට වැඩි පිරිසක්</strong> අපිත් එක්ක එකතු වෙලා ඉන්නවා. දැන් මගේ බලාපොරොත්තුව මැහුම් කරන හැටි කියලා දීලා එතනින් නවතින එක නෙවෙයි.

මැහුම් Hobby එකක් විදිහට කරන කෙනෙක්ට ඒ Skill එක තවත් දියුණු කරගෙන, තමන්ගේම ආදායමක් හදාගන්න, Customers ලා හොයාගන්න, Online එකේ තමන්ගේම Brand එකක් හදාගෙන Business එකක් විදිහට ඉස්සරහට යන්න අවශ්‍ය මඟපෙන්වීම ලබාදෙන එකයි.

ඒ ගමන තවත් ඉස්සරහට අරගෙන යන්න තමයි <strong>Su Collection, The UVA VEC එක්ක එකතු වෙන්නේ.</strong> Su Collection එකෙන් ලැබෙන මැහුම් සහ Product Development අත්දැකීමත්, <strong>The UVA VEC වෙතින් ලැබෙන Business, Digital සහ Technology පැත්තේ මඟපෙන්වීමත්</strong> එකට එකතු කරලා, ඔයාගේ Skill එක වර්තමානයට ගැළපෙන <strong>Business එකක් විදිහට ගොඩනගාගන්න අවශ්‍ය Support එක ලබාදෙනවා.</strong>

<strong>මැහුම් කියන්නේ Skill එකක් විතරක් නෙවෙයි. හරියට ගොඩනගාගත්තොත්, ඒකෙන් ඔයාගේම අනාගතයක් හදාගන්න පුළුවන්.</strong>`
  },
  contact: {
    heroTitle: "Contact Us",
    heroDesc: "Have a question? We are here to help.",
    whatsappTitle: "WhatsApp Us",
    whatsappDesc: "For custom orders, class registrations, or general questions, our team is highly responsive on WhatsApp.",
    whatsappBtn: "Chat on WhatsApp",
    formTitle: "Send a Message"
  },
  dedicatedCourses: {
    '6-month-tailoring-business-mentorship': {
      pill: "100 DAYS COMPLETE PROGRAM",
      subtitle: "100-Day Tailoring Business Building Program",
      title: "Personal 1-on-1 Mentorship with Swarna",
      price: "රු. 45,000 (පහසු ගෙවීමේ ක්රමයටද ලබාගත හැක)",
      mainDesc: "ඔයාගේ skill එක ඊළඟ level එකට ගෙනියන්න.",
      subDesc: "මැහුම් කටයුතු ගැන තියෙන දැනුම තවත් නිවැරදි කරගන්න, difficult designs confidently handle කරන්න, සහ ඔයාගේම Custom Dress Business එකක් ගොඩනගන්න — Swarna මහත්මිය සමඟ Personal 1-on-1 Mentorship එකක් ලබාගන්න.",
      bulletTitle: "Mentorship එකෙන් ඔයාට ඉගෙනගන්න පුළුවන්:",
      bullet1Title: "Advanced Draping",
      bullet1Desc: "Professional draping techniques සහ garment shaping ක්රම ප්රායෝගිකව ඉගෙනගන්න.",
      bullet2Title: "Bridal Fitting",
      bullet2Desc: "Bridalwear සඳහා නිවැරදි measurements, fitting adjustments සහ professional finishing techniques ඉගෙනගන්න.",
      bullet3Title: "Custom Dress Making",
      bullet3Desc: "Client requirements අනුව custom designs develop කරලා නිවැරදි fit එකක් ලබාදෙන ආකාරය ඉගෙනගන්න.",
      bullet4Title: "Build Your Own Boutique",
      bullet4Desc: "ඔයාගේ skill එක business එකක් බවට පත්කරගෙන, තමන්ගේම profitable Custom Dress Boutique එකක් ගොඩනගන්න අවශ්ය මඟපෙන්වීම ලබාගන්න.",
      bottomTitle1: "Personal Guidance. Practical Learning. Real Results.",
      bottomDesc1: "ඔයාගේ current skill level එක, අවශ්‍යතාවය සහ ඉලක්කය අනුව personalised guidance එකක් ලබාගන්න. Generic class එකක් වෙනුවට, ඔයාට අවශ්‍ය දේ ගැනම direct guidance ලබාගන්න.",
      bottomTitle2: "Easy Payment Options Available",
      bottomDesc2: "Mentorship program එකට join වෙන්න පහසු payment options available. Payment details සහ available options ගැන දැනගන්න අපිත් එක්ක WhatsApp හරහා සම්බන්ධ වෙන්න.",
      bottomDescExtra: ""
    },
    '100-day-tailoring-business-workbook': {
      pill: "28 Pages | PDF E-Book |",
      subtitle: "Become a Successful Tailoring Entrepreneur in 100 Days",
      title: "100-Day Tailoring Business Workbook (PDF)",
      price: "LKR 690",
      mainDesc: "ඔයාගේ මැහුම් Skill එක Business එකක් බවට පත්කරගන්න දින 100ක Practical Roadmap එකක්.",
      subDesc: "මැහුම් කටයුතු කරන්න ඔයා දන්නවා — ඒත් මොනවද විකුණන්නේ, **Price එක හදාගන්නේ කොහොමද, Customers ලා හොයාගන්නේ කොහොමද, Orders ගන්නේ කොහොමද** කියලා තාම clear නැද්ද?\n\nමේ **100-Day Tailoring Business Workbook** එක හදලා තියෙන්නේ ඒ හැමදේම එකවර කරන්න ගිහින් අතරමං නොවී, **දින 100ක් පුරා එකින් එක වැඩ කරගෙන ඔයාගේම මැහුම් Business එකක් ගොඩනගාගන්න** ඔයාට Guide කරන්න.\n\nProduct එක තෝරගන්න තැන ඉඳන් **Costing & Pricing, WhatsApp Business, Facebook, TikTok, Content Creation, Customer Orders, Delivery, Launch සහ Business Growth** දක්වා — අද කරන්න ඕනේ මොකක්ද කියලා Step-by-Step follow කරන්න පුළුවන් Practical Guide එකක් මේ Workbook එක ඇතුළේ තියෙනවා.",
      bulletTitle: "Workbook එකෙන් ඔයාට:",
      bullet1Title: "Decide What to Sell & Build Your Product",
      bullet1Desc: "ඔයාගේ මැහුම් Skill එකට ගැළපෙන Products තෝරගෙන, රෙදි සහ Materials තෝරාගැනීම, Size Chart එක හදාගැනීම, Sample එකක් මහලා Fit එක Check කිරීම සහ **Costing & Pricing දක්වා Product එක විකුණන්න** Ready කරගන්න.",
      bullet2Title: "Build Your Online Business Presence",
      bullet2Desc: "**WhatsApp Business** setup කරගෙන Product Catalog එක හදාගන්න. ඒ එක්ක **Facebook සහ TikTok හරහා Customers ලාට ඔයාගේ Business එක හොයාගන්න පුළුවන්** Online Presence එකක් ගොඩනගාගන්න.",
      bullet3Title: "Create Content & Start Finding Customers",
      bullet3Desc: "Product Photos, Reels / TikToks, Behind-the-Scenes Content සහ Captions හදාගෙන, **Call-to-Actions සහ WhatsApp use කරලා ඔයාගේ Products ගැන** Interested Customers ලා Business එකට ගෙන එන්න.",
      bullet4Title: "Set Up Orders, Delivery & Customer Experience",
      bullet4Desc: "Order එකක් ආවම Customer Details සහ Order Details හරියට Manage කරගන්න, Courier Partner කෙනෙක් තෝරගන්න, Packaging සකස් කරගන්න සහ Order එක Customer ට Deliver කරන Process එක හදාගන්න.",
      bullet5Title: "Prepare & Launch Your Collection",
      bullet5Desc: "Products Batch එකක් සූදානම් කරගෙන, Pre-Launch Content හරහා Interest එකක් හදාගෙන, **Official Launch එක කරන්න සහ Orders Dispatch කරන තැන දක්වා** එකින් එක වැඩ කරගෙන යන්න.",
      bullet6Title: "Collect Reviews & Keep Growing",
      bullet6Desc: "Customers ලාගෙන් Reviews සහ Feedback එකතු කරගෙන **Social Proof හදාගන්න. ලැබුණු Results බලලා මොනවද වැඩ කරන්නේ කියලා** හඳුනාගෙන, **Next Collection / Next Batch එක තවත් හොඳට** Plan කරගන්න.",
      bullet7Title: "Follow Your 100-Day Checklist",
      bullet7Desc: "හැම අදියරකටම තියෙන **Practical Checklists සහ Tasks එකින් එක Complete කරගෙන**, “Business එකක් පටන්ගන්න ඕනේ” කියලා හිත හිත ඉන්නේ නැතුව දවසින් දවස වැඩේ කරගෙන යන්න.",
      bottomDescExtra: "දින 100 අවසානයේදී නිකන් Business Idea එකක් විතරක් තියාගෙන ඉන්න එක නෙවෙයි — **Product එකක්, ඒකට Price එකක්, Online Presence එකක්, Content Plan එකක්, Order & Delivery Process එකක් සහ ඊළඟට Business එක Grow කරගෙන යන්න පැහැදිලි Direction එකක් හදාගන්නයි** මේ Workbook එක ඔයාට Guide කරන්නේ.",
      bottomTitle1: "මේක කාටද?",
      bottomDesc1: "ගෙදර ඉඳන් මැහුම් කටයුතු කරන, **“මේ Skill එකෙන් මටත් ආදායමක් හදාගන්න පුළුවන්ද?”** කියලා හිතන අයට.\n\nමැහුම් Skill එක තියෙනවා, හැබැයි **Business එක පටන්ගන්නේ කොහෙන්ද කියලා තේරෙන්නේ නැති අයට**, Online වල තමන්ගේම **Brand එකක් ගොඩනගන්න කැමති අයට සහ තමන්ගේම Home Fashion Business එකක් පියවරෙන් පියවර ගොඩනගාගන්න බලාපොරොත්තු වෙන** අයට.",
      bottomTitle2: "",
      bottomDesc2: ""
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  content = signal<WebsiteContent>(defaultContent);
  loading = signal<boolean>(true);

  constructor() {
  }

  init(): Promise<void> {
    return new Promise((resolve) => {
      let resolved = false;
      const docRef = doc(db, 'content', 'website');
      onSnapshot(docRef, (docSnap) => {
        this.loading.set(false);
        if (docSnap.exists()) {
          const data = docSnap.data() as WebsiteContent;
          
          // Migration for old hardcoded keys (SEO updates)
          if (data.dedicatedCourses) {
            const dc = data.dedicatedCourses as any;
            if ((dc['mentorship'] || dc['couture-and-tailoring-business-mentorship']) && !dc['6-month-tailoring-business-mentorship']?.mainDesc) {
              dc['6-month-tailoring-business-mentorship'] = dc['couture-and-tailoring-business-mentorship'] || dc['mentorship'];
              delete dc['mentorship'];
              delete dc['couture-and-tailoring-business-mentorship'];
            }
            if (dc['sri-lankan-saree-jacket-master-blueprint'] && !dc['100-day-tailoring-business-workbook']?.mainDesc) {
              dc['100-day-tailoring-business-workbook'] = dc['sri-lankan-saree-jacket-master-blueprint'];
              delete dc['sri-lankan-saree-jacket-master-blueprint'];
            }
          }

          // If they accidentally saved empty fields, delete it so it falls back to defaultContent
          if (data.dedicatedCourses?.['6-month-tailoring-business-mentorship'] && !data.dedicatedCourses['6-month-tailoring-business-mentorship'].mainDesc) {
            delete data.dedicatedCourses['6-month-tailoring-business-mentorship'];
          }
          if (data.dedicatedCourses?.['100-day-tailoring-business-workbook'] && !data.dedicatedCourses['100-day-tailoring-business-workbook'].mainDesc) {
            delete data.dedicatedCourses['100-day-tailoring-business-workbook'];
          }
          
          // Force use of hardcoded about us content (overrides stale database content)
          delete (data as any).about;
          if ((data as any).home) {
            delete (data as any).home.testimonialQuote;
          }

          const merged = this.mergeDeep(defaultContent, data);
          // Force override the entire workbook dedicated course entry with local hardcoded copy.
          // Firebase has stale content that would win over defaults via mergeDeep.
          const workbookKey = '100-day-tailoring-business-workbook';
          if (merged.dedicatedCourses) {
            merged.dedicatedCourses[workbookKey] = { ...defaultContent.dedicatedCourses[workbookKey] };
          }
          this.content.set(merged);
        } else {
          this.content.set(defaultContent);
        }
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }, (error) => {
        console.error("Error fetching content:", error);
        this.loading.set(false);
        if (!resolved) {
          resolved = true;
          resolve();
        }
      });
    });
  }

  async updateContent(newContent: WebsiteContent) {
    const docRef = doc(db, 'content', 'website');
    await setDoc(docRef, newContent);
  }
  
  private mergeDeep(target: any, source: any): any {
    const isObject = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj);
    if (!isObject(target) || !isObject(source)) {
      return source;
    }
    const output = { ...target };
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = this.mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
    return output;
  }
}
