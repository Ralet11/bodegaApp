import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useColorScheme,
  Image,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Axios from 'react-native-axios';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { API_URL } from '@env';
import { setUser } from '../redux/slices/user.slice';
import { fetchCategories } from '../redux/slices/setUp.slice';
import PhoneInput from '../components/CountryInput';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';

// Imports for Google Sign-In
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

// Constante para los Terms of Service (rellena con tu contenido)
const TERMS_TEXT = `Bodega+ Terms of Service



Last Updated: February 26, 2025



Please read these Terms of Service (“Terms”) carefully before using Bodega+. By creating an account or using the Bodega+ app or website (collectively, the “Platform”), you agree to be bound by these Terms. These Terms form a legal agreement between you and Bodega+ (“Bodega+”, “we”, “us”, or “our”). If you do not agree to any part of these Terms, you must stop using the Platform. These Terms apply to both users (customers) and merchants (business partners offering food and beverages through Bodega+), and set forth the rights and responsibilities of each party.



1. Overview of Bodega+ Service



1.1 Description of Service: Bodega+ is a marketplace platform in the food and beverage industry that connects users with participating restaurants, bars, cafes, ice cream shops, and similar merchants (“Merchants”). We provide a platform for users (“you” or “Customers”) to discover exclusive discounts and place orders for food and beverages from Merchants. Bodega+ acts solely as an intermediary facilitating these transactions – we are not a restaurant or food provider. All food and beverages available on the Platform are provided by independent Merchants.



1.2 No Endorsement or Guarantee: Bodega+ does not guarantee the quality, safety, or fulfillment of any products or services provided by Merchants. Merchants are solely responsible for the products they provide, including their quality, ingredients, and compliance with health and safety regulations. Bodega+ does not warrant that any Merchant holds necessary permits or licenses, or that they will meet your expectations. By using the Platform, you understand that any Orders (as defined below) you place are transactions between you and the Merchant, and Bodega+ is not the seller of the items. We provide technology and support to facilitate your order and payment, but we do not prepare, pack, or deliver the food ourselves.



1.3 User Benefits: Bodega+ offers users special perks such as exclusive discounts, promotional deals, loyalty rewards, and referral bonuses on food and beverage purchases. These offers are provided to enhance your experience and savings when ordering through the Platform. All discounts and promotions are subject to the terms and conditions outlined in these Terms and any additional offer-specific terms. Merchants may fund or participate in these discounts, and availability may vary by location and Merchant.



2. Eligibility and Accounts



2.1 Eligibility: You must be at least 18 years old (or the age of legal majority in your jurisdiction) to create an account or use the Platform. By registering, you represent that you are legally capable of entering into binding contracts. Individuals under 18 may only use the Platform under the supervision of a parent or legal guardian who consents to these Terms. Bodega+ is intended for personal use; commercial use by customers (for example, reselling orders) is not permitted.



2.2 Account Registration: To access many features of Bodega+ (such as placing an order or redeeming rewards), you will need to create a user account. When registering, you agree to provide true, accurate, and complete information (such as your name, valid email, phone number, and payment details) and to keep it updated. You are responsible for maintaining the confidentiality of your account login credentials and for all activities that occur under your account. Do not share your account with others or use someone else’s account without permission. If you suspect any unauthorized use of your account, notify us immediately at support@bodega-plus.com.



2.3 Account Security: You are responsible for all activity on your Bodega+ account. Use a strong password and protect your login information. We will not be liable for any loss or damage arising from unauthorized use of your account. Bodega+ reserves the right to suspend or terminate your account at any time if we suspect fraudulent activity, misuse of the Platform, or violation of these Terms.



2.4 Communications Consent: By creating an account, you consent to receive communications from Bodega+ and Merchants electronically, such as by email, SMS/text messages, push notifications, or through the app/website. These communications may include order confirmations, receipts, delivery updates, promotions, and other account-related or marketing messages. You can opt out of non-transactional marketing communications at any time by using the unsubscribe mechanism provided (for example, texting “STOP” to opt out of SMS, or clicking “unsubscribe” in our emails). Please note that even if you opt out of marketing messages, we may still send you transactional communications (such as order status or important account notices) as these are necessary for providing our services.



3. Placing Orders and Payment Processing



3.1 Orders: When you place an order for food or beverages through Bodega+ (an “Order”), you are making an offer to purchase those items from the Merchant. The Merchant must accept and confirm each Order before it is finalized. All Orders are subject to acceptance by the Merchant. Bodega+ will provide you a confirmation once the Merchant has accepted your Order. The contract of sale for the food and beverages is directly between you and the Merchant. Bodega+ is not a party to that contract, but will assist in coordinating the Order and payment as described in these Terms.



3.2 Pricing and Exclusive Discounts: The prices for menu items are set by the Merchants. Through Bodega+, you may receive exclusive discounts or promotional pricing on certain items or orders. These discounts are displayed before you check out. All prices and discounts are subject to change until you place the Order. In the event a pricing error is identified after an Order, Bodega+ or the Merchant will contact you with the correct price and you may choose to proceed or cancel the Order without charge. Discounts cannot be exchanged for cash and may be subject to additional conditions (e.g., minimum order value or expiration dates). We strive to ensure advertised discounts are honored; however, if a Merchant fails to apply a discount, please contact Bodega+ support for assistance.



3.3 Payment Authorization: By placing an Order, you authorize Bodega+ to charge your provided payment method for the total amount of the Order, which includes the cost of items, any applied discounts, taxes, and any optional tip or gratuity you add for the Merchant’s staff. Bodega+ uses a third-party payment processor, Stripe, to securely process payments. When you enter your payment information, it will be transmitted securely to Stripe. All payment processing is subject to Stripe’s own Terms of Service and Privacy Policy. Bodega+ does not store your full credit card number; financial information is handled by Stripe in accordance with industry standards. You agree to pay for all Orders you place through Bodega+. If your payment method fails or is declined, you may not be able to complete your Order.



3.4 Commission and Fees: Using the Bodega+ Platform is free for Customers – there are no subscription fees or direct charges to users for accessing our discounts or service. Bodega+ earns revenue by charging Merchants a commission fee of 10% on each sale made through the Platform. This commission is deducted from the payments we remit to Merchants. Prices you pay as a Customer already reflect this arrangement; you will not be separately charged a commission or service fee by Bodega+ for your Order (aside from the item price, tax, and tip as applicable). Merchants agree that Bodega+ may deduct the 10% commission (and any agreed platform fees, if applicable) from the gross amount of the Order before remitting the payout to the Merchant. Aside from this commission (paid by Merchants), Bodega+ may at times charge Merchants additional fees for optional advertising or premium placement, but any such fees will be agreed in advance between Bodega+ and the Merchant.



3.5 Merchant Payouts: Bodega+ will collect Order payments from Customers on behalf of the Merchant, then distribute the proceeds (minus our commission and any applicable fees or chargebacks) to the Merchant. Merchant payouts are typically made via direct deposit (ACH) to the bank account the Merchant has on file with us, facilitated by Stripe. Payouts generally occur on a regular schedule (for example, weekly), subject to any settlement times or holds for fraud prevention or dispute resolution. Bodega+ is not responsible for any delays in funds reaching the Merchant’s bank once we have initiated a payout; bank processing times may vary. Merchants are responsible for providing accurate banking information to receive payouts. Any errors in payout due to incorrect information provided by the Merchant are the Merchant’s responsibility.



3.6 Taxes: Merchants are solely responsible for calculating, collecting, reporting, and remitting any sales tax, VAT, or other governmental taxes or fees that apply to the sale of their food and beverages. The Merchant’s item prices or your Order total may include such taxes, depending on local laws. Bodega+ may display estimated taxes at checkout based on information from the Merchant, but Bodega+ is not the seller and does not assume responsibility for the accuracy of tax calculations. Merchants must ensure they comply with all tax laws and provide Customers with receipts or invoices including tax information where required by law. You agree that you are responsible for any taxes or duties associated with your purchases through the Platform (other than taxes based on Bodega+’s income). If Bodega+ is found to be responsible for remitting taxes on behalf of a Merchant in any jurisdiction, the Merchant agrees to cooperate and reimburse Bodega+ for such amounts.



4. Merchant Responsibilities and Standards



The following section applies to all Merchants using Bodega+ to offer their products:



4.1 Merchant Compliance: By using Bodega+, Merchants represent and warrant that they hold all required licenses, permits, certifications, and approvals to prepare and sell food and beverages (including any alcohol, if applicable) in their jurisdiction. Merchants must comply with all applicable laws and regulations, including but not limited to health codes, food safety regulations, alcohol sale laws, consumer protection laws, and any rules regarding promotions or gift certificates. Bodega+ does not supervise or control the Merchant’s operations and is not responsible for a Merchant’s failure to comply with laws. Merchants are responsible for ensuring the accuracy of the information on their Bodega+ listing (such as menu items, prices, descriptions, hours of operation, and any allergen notices).



4.2 Quality and Service: Merchants agree to fulfill accepted Orders in a timely, professional manner consistent with the quality and service standards typical for their industry. This includes preparing the correct items as ordered, honoring advertised discounts or loyalty rewards, and packaging the items safely for pickup or delivery (if delivery is offered through Bodega+ or by the Merchant). Merchants are solely responsible for the quality, freshness, and safety of the food and beverages provided. If a Merchant offers delivery (either via their own staff or a third-party courier), the Merchant is responsible for delivery timing and any delivery-related customer service issues. Bodega+ does not guarantee delivery times or food condition upon arrival. If you are a Customer and experience an issue with the quality or delivery of your order, see Section 7 on dispute resolution for how we can assist.



4.3 Pricing and Promotions: Merchants have control over the pricing of their products on Bodega+ and the terms of any promotions (subject to any Bodega+ platform requirements). Merchants must not knowingly list false or misleading prices or descriptions. If a Merchant offers an exclusive discount or promotion to Bodega+ users, the Merchant is expected to honor that promotion for the duration advertised. Merchants may modify their prices or promotions, but changes will not affect Orders already placed and accepted. Bodega+ may require Merchants to provide certain minimum discounts or promotional offers as part of participating in the platform’s marketing programs or user loyalty initiatives, but any such requirements will be communicated and agreed in advance.



4.4 Order Cancellations by Merchant: Merchants have the right to refuse or cancel Orders in certain situations, such as if an item is out of stock, the Merchant is unexpectedly unable to fulfill the order (e.g., due to an emergency), or if there is a clear pricing error. If a Merchant needs to cancel an Order after acceptance, the Merchant should notify the Customer and Bodega+ immediately, and the Customer will be issued a full refund for that Order. Excessive or unjustified Order cancellations may result in Merchant penalties or removal from the platform, as they undermine user trust.



4.5 Merchant Content and Marketing: Merchants may provide Bodega+ with content such as logos, menu photos, item descriptions, trademarks, or other materials (“Merchant Content”) to display on their store page or in marketing campaigns. The Merchant grants Bodega+ a non-exclusive, royalty-free license to use, display, and reproduce this Merchant Content on the Platform and in related marketing or promotional materials for the purposes of operating and promoting the Bodega+ service. The Merchant is responsible for ensuring that none of their provided content infringes any third-party intellectual property rights or is unlawful. Bodega+ may resize, format, or moderate Merchant Content as needed, and reserves the right to remove or refuse to display any content that violates these Terms or our policies.



5. User Responsibilities and Acceptable Use



This section applies to users (customers) of Bodega+:



5.1 Accurate Information: You agree to provide accurate information when placing Orders (such as correct name, contact information, and any delivery details if applicable). Do not attempt to deceive or mislead Merchants or Bodega+ (for example, by placing fake orders or using a fraudulent payment method). Misuse of the Platform for fraudulent or illegal activity can result in immediate termination of your account and potential legal action.



5.2 Appropriate Conduct: You agree to use Bodega+ only for its intended purpose of ordering food and beverages for personal use and participating in our promotions. You will not abuse the exclusive discounts, loyalty rewards, or referral programs in ways they were not intended. Prohibited behaviors include, but are not limited to:

• Creating multiple accounts to redeem the same promotion multiple times or to self-refer for referral credits.

• Using bots, scripts, or automated methods to place orders or extract data from the Platform.

• Harassing, threatening, or abusing any Merchant, their staff, other users, or Bodega+ staff (for example, through offensive language or inappropriate behavior when picking up an order).

• Attempting to circumvent the Platform’s commission structure by arranging payment to a Merchant outside the Platform for orders discovered through Bodega+.

• Engaging in any activity that violates any law or regulation, such as using Bodega+ to facilitate the purchase of alcohol if you are underage, or any activity that infringes on any party’s rights.



Bodega+ reserves the right to investigate and take any appropriate action for any suspected violations of this Section 5. This may include canceling Orders, suspending or terminating accounts, revoking loyalty or referral credits, and/or reporting misconduct to law enforcement.



5.3 User Content and Reviews: If Bodega+ allows users to submit ratings, reviews, feedback, or other content on the Platform about your dining experiences (“User Content”), you agree to post content that is honest and fair, and not defamatory, obscene, or abusive. You represent that any User Content you provide is your own original content (or you have permission to post it) and that it does not violate the rights of any third party. By posting User Content, you grant Bodega+ a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute your content in connection with the Platform (for example, displaying your review on a Merchant’s page). We reserve the right to moderate, edit, or remove User Content at our discretion if it violates our guidelines or policies. We do not claim ownership of your User Content, and any opinions you express in User Content are your own — Bodega+ is not responsible for User Content provided by any customer.



6. Promotions, Loyalty Rewards, and Referrals



Bodega+ offers various engagement features to reward our users and encourage platform growth. These include loyalty programs, referral programs, and influencer promotions. By participating in any Bodega+ promotion or reward program, you agree to the additional terms in this section.



6.1 Loyalty Rewards Program: Bodega+ may offer a loyalty program where users earn points or rewards (“Loyalty Points”) for certain actions, such as making purchases or engaging with the app. The accumulation and redemption of Loyalty Points are governed by the following:

• Earning Points: The program rules (available in the app or our website) will detail how points are earned (e.g., a certain number of points per dollar spent, or bonus points for specific actions or during promotions). Bodega+ reserves the right to adjust point earning rates at any time, but changes will not apply retroactively to purchases already made.

• Redeeming Points: Points can be redeemed for rewards such as discounts on future orders, free items, or other benefits as described in the loyalty section of the Platform. Redemption offers may require a minimum point balance and are subject to availability.

• No Cash Value & Non-Transferability: Loyalty Points and rewards have no cash value (they are promotional incentives only) and are not transferable or redeemable for cash. Points are personal to your account and cannot be sold, gifted, or combined between accounts.

• Expiration and Changes: Unless otherwise stated, Loyalty Points do not expire as long as the loyalty program is active and your account is in good standing. However, Bodega+ reserves the right to modify or terminate the loyalty program at any time. If we end the program or make significant changes, we will provide reasonable notice via the Platform or email. Any unredeemed points may be forfeited if the program is terminated or if your account is terminated (see below).

• Abuse of Program: Any fraud or abuse of the loyalty program (such as using multiple accounts, exploiting bugs, or other improper conduct) can result in forfeiture of points and termination of your participation in the program. Bodega+ has sole discretion to determine what constitutes abuse and to take appropriate action, including deducting improperly earned points or closing your account.

• Account Termination: If your Bodega+ account is terminated by you or by us for any reason (for example, violation of these Terms), any unredeemed Loyalty Points or rewards in your account will be forfeited.



6.2 Referral Program: Bodega+ may offer a referral program that rewards users for inviting new users or Merchants to the Platform. For example, you might receive a coupon or credit when a friend you refer signs up with your referral code and places their first order. If a referral program is active, the specific terms (reward amount, conditions, etc.) will be described in the app or on our site, but the following general terms apply:

• Eligibility: Referral rewards (sometimes called “Referral Credits”) may be offered to existing users who are inviting new users who have never used Bodega+ before. You cannot refer yourself or existing users. There may be a limit to the number of referral rewards you can earn, and any such limits will be disclosed in the program details.

• Reward Conditions: Typically, a referral reward is granted when the referred person creates a valid account and completes a required action (like making an initial purchase above a certain amount). Referral rewards might be a discount on a future order, Bodega+ credit, or other benefit. Each reward will have any applicable expiration date or usage restrictions explained at issuance.

• No Spam or Misconduct: When referring others, you must do so in a personal and respectful way. Bulk emails, spam, or posting your referral code publicly on coupon sites or similar mass distribution channels is not allowed. You should not misrepresent Bodega+ or the nature of the referral offer to persuade others. Referral codes are for individual, non-commercial use only.

• Combining with Other Offers: Referral credits are considered promotional and may not be combined with certain other Bodega+ promotions or offers, unless explicitly allowed by the terms of a specific promotion.

• Program Changes: Bodega+ reserves the right to change the referral program terms or end the referral program at any time. We also reserve the right to withhold or invalidate referral rewards if we suspect that the referral was not made in good faith, is fraudulent, or otherwise violates the referral terms or these Terms of Service. For instance, if we suspect you created fake accounts or referred people who you did not know personally just to gain credits, we may not issue the credits or may revoke them.

• Influencer or Affiliate Referrals: If you are participating in an official Bodega+ influencer or affiliate program (where you are given a special code to share as part of a sponsorship or partnership), you may be subject to additional terms provided in a separate agreement. Generally, influencer partners must comply with advertising disclosure laws (such as clearly stating when a post is an ad or partnership) and any guidelines we provide. Those additional terms will supplement these Terms. In case of conflict, the specific influencer program agreement will govern for those aspects.



6.3 Influencer Marketing and Third-Party Promotions: Bodega+ may engage influencers or run joint promotions with third parties to spread awareness of the platform. Any opinions or content expressed by such influencers are their own and do not reflect Bodega+’s opinions. Bodega+ is not liable for any statements, claims, or content made by influencers or partners that are not directly controlled by us. If an influencer provides a promotional code or link for Bodega+, any use of that code is subject to these standard Terms and any additional conditions attached to the code. All users must still meet eligibility and comply with the Terms regardless of how they learned about Bodega+.



6.4 Promotional Offers: Occasionally, Bodega+ or Merchants might offer special promotions (such as limited-time discounts, buy-one-get-one offers, contest giveaways, etc.). All such promotions are subject to change or cancellation at any time without prior notice (unless required by law). Promotions may have specific terms – for example, a promo code might only be usable once per user, or a “Happy Hour” discount might only apply during certain hours. These specific conditions will be stated in the offer details. In the event of any conflict between the promotion-specific terms and these Terms of Service, the promotion-specific terms will govern for that particular offer. However, general provisions like liability and dispute resolution in these Terms still apply to promotional offers.



7. Cancellations, Refunds, and Dispute Resolution



7.1 Order Changes and Cancellations (Customer Initiated): Once you submit an Order through Bodega+, the Merchant typically begins preparing it promptly. If you realize you need to change or cancel your Order, you should contact us immediately through the app or via our support email/phone. We will reach out to the Merchant to request the change or cancellation. However, changes or cancellations are not guaranteed after an Order is placed. Merchants have their own cancellation policies – for example, a restaurant might not allow cancellation once cooking has started, or they may charge for items already prepared. Bodega+ will do its best to accommodate your request, but if the Order is already being made or is completed, a cancellation may not be possible. In such cases, you will be charged for the Order. If a Merchant agrees to a cancellation or if an item is unavailable, Bodega+ will issue a refund for the canceled items as appropriate.



7.2 Issues with Orders: If there is a problem with your Order (e.g., missing item, incorrect order, substandard quality, or other issue), you should first attempt to resolve it with the Merchant at the time of pickup or delivery if possible. If that’s not possible or satisfactory, contact Bodega+ customer support within 48 hours of receiving the Order to report the issue. Please provide details and any relevant evidence (photos, description of the problem). Bodega+ will review your complaint and may act as a mediator between you and the Merchant to reach a resolution. Resolutions might include, at Bodega+’s discretion: a partial or full refund, a re-delivery or re-preparation of the missing/wrong items, or a credit or coupon for future use as a goodwill gesture. Bodega+’s determination of the resolution will consider the specifics of the incident, the Merchant’s input, and our policies. Our goal is to be fair and ensure a positive experience, but we do not guarantee any particular outcome.



7.3 Refund Policy: Refunds for Orders are handled on a case-by-case basis. Because the contract for an Order is between you and the Merchant, Merchants set their own refund policies subject to applicable consumer laws. Bodega+ will facilitate refund requests in line with those policies and our platform standards. Generally:

• If an Order is never received (for example, you arrive and the Merchant never had the order, or a delivery never arrived) and it’s due to a fault of the Merchant or Bodega+, you will be entitled to a full refund.

• If part of your Order is unsatisfactory (e.g., an item was missing or incorrect), and you report it timely, we may provide a refund or credit for that portion of the Order.

• If you simply did not enjoy the food or it didn’t meet personal expectations, that alone may not qualify for a refund, as Bodega+ cannot guarantee taste or personal satisfaction.

• If you were charged incorrectly (e.g., wrong amount), we will correct the charge or issue a refund of the difference.



Refunds, if approved, will be issued to the original payment method whenever possible. Please note that it may take several business days for refunds to process through your bank or credit card. In some cases, Bodega+ may issue you an alternative compensation (such as Bodega+ credits) if standard refund to your card is not feasible or if you agree to that form of compensation.



7.4 Merchant Disputes: Merchants should report any Customer-related issues (such as suspected fraud, abusive behavior, or disputes about payment) to Bodega+ in a timely manner. Bodega+ will similarly mediate disputes that Merchants raise regarding customers. For example, if a Merchant believes a refund was unwarranted or a customer falsely reported an issue, we will review evidence from both sides and make a good-faith decision. Merchants agree to abide by Bodega+’s resolution of any platform-mediated dispute, which may include absorbing the cost of a refund or other corrective measures, in accordance with our policies.



7.5 Mediation by Bodega+: In all disputes between a Customer and a Merchant, Bodega+’s role is to assist in finding a mutually agreeable solution. While Bodega+ has some authority to provide refunds or credits, we do not guarantee that every dispute will be resolved to a customer’s complete satisfaction. Conversely, we strive to be fair to Merchants and will not penalize them for issues outside their control. Our customer support team may make a final determination based on the evidence available. By using the Platform, both Customers and Merchants agree to cooperate in good faith with any investigation or resolution efforts by Bodega+, and to provide any information reasonably requested.



7.6 Binding Arbitration and Governing Law (for Disputes with Bodega+): This section applies to any disputes you may have with Bodega+ (not those purely between Customer and Merchant). We hope to resolve most concerns through our support team, but if a dispute arises between you and Bodega+ relating to these Terms or the use of our services that cannot be resolved informally, the following provisions apply:

• Governing Law: These Terms and any dispute between you and Bodega+ are governed by the laws of the United States and the State of Florida, without regard to its conflict of law principles. However, if you are a consumer residing outside the U.S., you may be entitled to the protections of the mandatory consumer protection laws of your country of residence.

• Arbitration Agreement: You and Bodega+ agree that any dispute, claim, or controversy arising out of or relating to these Terms or the use of the Platform (collectively, “Claims”) will be resolved by binding arbitration on an individual basis, except for the exceptions outlined below. You are waiving your right to litigate such disputes in court (including a right to a jury trial) and your right to participate as a plaintiff or class member in any class, collective, or representative action.

• Exceptions: Either party may choose to bring individual Claims in small claims court if they qualify. Additionally, either party may bring claims for injunctive relief to stop unauthorized use or abuse of the Platform or intellectual property infringement (for example, unlawful use of the Bodega+ trademark) in a court of law.

• Arbitration Procedures: A neutral arbitrator (selected by agreement of the parties, or if not agreed, through an arbitration provider) will conduct the arbitration. The arbitration will be administered by a reputable arbitration organization (such as the American Arbitration Association “AAA”) under its rules applicable to consumer disputes. The arbitration may be conducted via written submissions, telephone, or in-person in the county where you live or another mutually agreed location.

• Costs: Each party is responsible for their own attorneys’ fees, but the arbitration filing fees and arbitrator’s fees will be governed by the rules of the arbitration body and applicable law. Bodega+ will abide by any requirement under law to cover certain costs if the claims are under a certain dollar amount or if required to make arbitration accessible.

• Authority of Arbitrator: The arbitrator has the authority to grant any remedy that would otherwise be available in court, except that the arbitrator may not conduct a class or collective arbitration, as the parties agree any arbitration will be solely between the individual parties. If this class action waiver is found unenforceable, then the entirety of this arbitration section shall be null and void, but the rest of the Terms will remain in effect.

• Opt-Out: You have the right to opt out of this arbitration agreement by sending written notice of your decision to opt out to our mailing address (provided in the Contact section) or via email to legal@bodega-plus.com within 30 days of first accepting these Terms. If you opt out of arbitration, you retain your right to litigate in court and the class action/jury trial waiver above will not apply to you. Opting out of arbitration will not affect any other section of these Terms.

• Survival: This arbitration agreement will survive the termination of your relationship with Bodega+.



7.7 Venue: If the arbitration agreement is not enforceable, or if you opt-out of arbitration, then you agree that any judicial proceeding (other than small claims) will be brought in the federal or state courts of Miami-Dade County, Florida, United States, subject to any applicable consumer protection law that may allow you to choose a different venue. Both you and Bodega+ consent to venue and personal jurisdiction there.



7.8 Time Limits: To the extent permitted by law, any claim or cause of action you have against Bodega+ arising out of or related to the use of the Platform or these Terms must be filed within one (1) year after such claim or cause of action arose, or else it will be permanently barred. (This does not apply to consumers in jurisdictions that prohibit such a time limitation.)



8. Intellectual Property and License



8.1 Ownership of Bodega+ IP: Bodega+ (or its licensors) owns all rights, title, and interest in and to the Platform, including all software, text, media, logos, trademarks, graphics, and content used therein (excluding User Content and Merchant Content provided by our users or partners). Bodega+™, the Bodega+ logo, and any other Bodega+ product or service names are trademarks of Bodega+. These Terms do not grant you any ownership of or license to any intellectual property rights in the Bodega+ name, logos, or other proprietary content, except for the limited usage rights expressly stated.



8.2 License to Users: Subject to your compliance with these Terms, Bodega+ grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform (and to install and use our mobile app, if applicable) solely for the purpose of ordering products from Merchants or otherwise using the Platform as a consumer or Merchant of our services. You may not use the Bodega+ Platform for any unlawful or competitive purpose (for example, you may not use our app to create a competing service, or reverse-engineer our software). You also may not use any of our trademarks, branding, or logos without our prior written permission, except as allowed under fair use law.



8.3 License to Merchants: If you are a Merchant, Bodega+ grants you a limited license to access and use the merchant dashboard or tools provided, for the purpose of managing your offerings on Bodega+. This license is also non-transferable and revocable. Merchants may not use Bodega+ branding except as specifically permitted (for instance, you may advertise that you are on Bodega+ and use our logo in marketing materials per any brand guidelines we provide).



8.4 Feedback: We appreciate feedback, comments, and suggestions from our users and partners. If you choose to submit feedback or ideas to us (e.g., suggestions for improvements, new features, etc.), you agree that Bodega+ is free to use those ideas or suggestions without any restriction or compensation to you. You hereby grant Bodega+ a perpetual, irrevocable, worldwide, royalty-free license to use and incorporate any feedback you provide in any manner deemed appropriate by Bodega+.



9. Disclaimers of Warranty



9.1 “As-Is” Service: Bodega+ provides the Platform and all services “AS IS” and “AS AVAILABLE”. While we strive to provide a great experience, we do not make any warranties or guarantees that the Platform will meet your requirements or expectations, or that it will be uninterrupted, error-free, secure, or always available. Use of the Platform (including any material or content obtained via the Platform) is at your own risk.



9.2 No Warranty on Merchant Offerings: Bodega+ does not warrant the quality, suitability, safety, or legality of any food, beverage, or services provided by Merchants. Any issues or potential liabilities arising from consumption of a Merchant’s products (such as food-borne illness, allergic reactions, injuries, etc.) are strictly between the Customer and the Merchant. Merchants are independent businesses and are not under our control, therefore we make no representation that any Merchant will perform as promised, or that their food preparation will be in accordance with your expectations or any specific standards (though we certainly hope it is). We encourage Users to exercise standard precautions, such as reviewing a Merchant’s ratings/reviews and any provided health or allergen information.



9.3 No Other Warranties: To the maximum extent allowed by law, Bodega+ disclaims all warranties and conditions of any kind, whether express, implied, or statutory, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, and any warranties that may arise from course of dealing or usage of trade. We do not guarantee that the information on the Platform (for example, menu descriptions or pricing) is accurate or up-to-date, though we strive for accuracy. We also do not warrant that any errors or defects in the Platform will be corrected.



Some jurisdictions do not allow the disclaimer of certain warranties, so some of the above disclaimers may not apply to you. In such cases, any required warranty is limited in duration to 30 days from first use of the Platform.



9.4 Third-Party Services: The Platform may incorporate or link to third-party services (such as Stripe for payments, or social media for login, or mapping services for location). Bodega+ is not responsible for the availability, reliability, or content of any third-party services. Your use of third-party services may be subject to those third parties’ terms and privacy policies, and we are not liable for any acts or omissions of such third parties.



10. Limitation of Liability



10.1 Limitation on Types of Damages: To the fullest extent permitted by law, Bodega+ and its affiliates, officers, employees, agents, and partners will not be liable to you for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, business, goodwill, or other intangible losses, arising out of or in connection with (a) your use of or inability to use the Platform; (b) any conduct or content of any third party (including Merchants) on the Platform; or (c) any goods or services obtained through the Platform (including any problems with food or drinks), even if Bodega+ has been advised of the possibility of such damages. This disclaimer includes damages for any offensive or illegal conduct by other users or Merchants, or unauthorized access, use, or alteration of your transmissions or data.



10.2 Cap on Liability Amount: To the fullest extent permitted by applicable law, the total aggregate liability of Bodega+ and its affiliates, and their respective officers, employees, and agents, to you for any and all claims arising from or related to these Terms or the use of the Platform is limited to the greater of: (a) the amount of fees (commissions) Bodega+ received from the Merchant for your orders in the six (6) months prior to the event giving rise to the claim, or (b) US $100.00. The existence of multiple claims or occurrences will not enlarge this limit. This means that if you have a claim against us, the most you could recover (if liability is established) is $100 or the small commission amount we earned related to your use, whichever is greater.



10.3 Exceptions: The limitations above in this Section 10 do not limit or exclude liability for Bodega+’s gross negligence, willful misconduct, or fraud, or for any other liability that cannot be excluded or limited under applicable law (for example, certain liability under product liability laws or for personal injury caused by negligence may not be limitable). However, in any case, Bodega+’s liability will be limited to the fullest extent permitted by law.



10.4 Acknowledgement: You acknowledge and agree that the disclaimers and limits in Sections 9 and 10 are a reasonable allocation of risk and form an essential part of this agreement, and that without these limitations, the fees and commission charged would be different (or Bodega+ might not offer the service at all). Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of these limitations may not apply to you. In such jurisdictions, liability is limited to the greatest extent permitted by law.



11. Indemnification



You agree to indemnify, defend, and hold harmless Bodega+ and its parent company, affiliates, and each of their respective officers, directors, employees, and agents (the “Indemnified Parties”), from and against any and all claims, liabilities, damages, losses, and expenses (including reasonable attorneys’ fees and costs) that arise out of or relate to: (a) your use or misuse of the Platform; (b) your violation of any of these Terms; (c) your violation of any applicable law or regulation (including any local food, alcohol, or safety laws) or the rights of any third party; (d) if you are a Merchant, your products or services (including any harm or damages to Customers from consuming your food/drink, or property damage/injury at your establishment, etc.), your breach of any Merchant representations in Section 4, or any content you provide; or (e) if you are a Customer, any fraud, negligence or willful misconduct on your part (including chargeback abuse or fraudulent dispute claims). Bodega+ reserves the right to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which case you agree to cooperate with Bodega+’s defense strategy as reasonably requested. You may not settle any claim against an Indemnified Party without Bodega+’s prior written consent, unless such settlement releases all Indemnified Parties from all liability and does not require any payment or admission of wrongdoing by any Indemnified Party.



12. Termination of Service



12.1 Termination by You: You are free to stop using Bodega+ at any time. You may delete your account by following the instructions in the app or contacting us at support@bodega-plus.com. Deleting your account will terminate your ability to log in and use our services. However, the Terms that by their nature should survive termination (such as arbitration agreement, limitation of liability, etc.) will continue to apply to you even after account deletion.



12.2 Termination or Suspension by Bodega+: We may suspend or terminate your account or access to the Platform at any time, with or without cause, with or without notice. We may do this if, for example, we reasonably believe: (a) you have violated these Terms or any applicable laws; (b) you pose a security or fraud risk; (c) you are engaging in improper or objectionable conduct; or (d) we decide to discontinue the Platform entirely. In most cases, we will attempt to provide notice of suspension or termination, but we are not obligated to do so if we determine immediate action is prudent. If you are a Merchant, we may also suspend your listings or remove your store from Bodega+ if we receive serious complaints or detect issues that put Customers at risk (health hazards, multiple bad experiences, etc.), or if you fail to fulfill orders reliably.



12.3 Effect of Termination: Upon termination of your account, whether by you or us, your right to use the Platform ceases immediately. If you are a Customer, you will lose access to any unused promotional credits, referral credits, or loyalty points as described earlier (they are forfeited). If you are a Merchant, any pending Orders at time of termination may be canceled (with refunds to customers as applicable). Commissions on any completed sales prior to termination remain due. Any data associated with your account will be handled in accordance with our Privacy Policy. Note that some residual copies of your information (like support emails or transaction records) may remain in our backup systems even after account deletion, to the extent allowed by law.



12.4 Survival: Any provision of these Terms which by its nature should survive termination (including but not limited to provisions regarding arbitration, governing law, liability, indemnity, and any licenses granted to Bodega+ such as for feedback or content) will survive the termination of your access to the service.



13. Miscellaneous



13.1 Changes to Terms: Bodega+ may update or revise these Terms from time to time. When we make changes, we will post the updated Terms on our website and update the “Last Updated” date at the top. For significant changes, we may also provide a notice to you via email or in-app notification. Continued use of the Platform after the effective date of revised Terms constitutes your acceptance of those Terms. If you do not agree to the new or modified Terms, you should stop using the Platform and, if desired, delete your account. It is your responsibility to review these Terms periodically for updates.



13.2 Entire Agreement: These Terms (along with any other policies or terms expressly referenced herein, such as the Privacy Policy and any promotion-specific terms) constitute the entire agreement between you and Bodega+ regarding your use of the Platform, and supersede any prior agreements or understandings between us relating to such subject matter. Any additional or different terms proposed by you (for example, in a purchase order or email) are rejected unless expressly agreed to in writing by an authorized representative of Bodega+.



13.3 Severability: If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court or arbitrator of competent jurisdiction, that provision will be enforced to the maximum extent permissible, and the remaining provisions of these Terms will remain in full force and effect. The invalid provision will, at our discretion, be modified so as to be made valid or eliminated to the minimum extent necessary, while preserving the original intent of the parties.



13.4 Waiver: Our failure to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision. Any waiver must be in writing and signed by an authorized representative of Bodega+ to be effective. A waiver of any breach or default on one occasion does not constitute a waiver of any subsequent breach or default.



13.5 Assignment: You may not assign or transfer these Terms (or any of your rights or obligations hereunder) without our prior written consent. Any attempted assignment without consent is null and void. Bodega+ may freely assign or transfer these Terms or any of our obligations without restriction, including in connection with a merger, acquisition, sale of assets, or by operation of law. These Terms will bind and inure to the benefit of the parties, their successors, and permitted assigns.



13.6 No Third-Party Beneficiaries: These Terms do not and are not intended to confer any rights or remedies upon any person other than you and Bodega+. The only exceptions are that Merchants and Customers are each agreeing to this same set of Terms, and Bodega+’s affiliates and indemnitees are intended beneficiaries of the indemnification and limitation of liability provisions.



13.7 Relationship of Parties: Bodega+ is an independent service provider. Nothing in these Terms shall be construed as creating an employer-employee relationship, partnership, joint venture, franchise, or agency relationship between you and Bodega+. Merchants are independent third-party contractors and are not employees, agents, or representatives of Bodega+. Bodega+ does not direct or control the day-to-day operations of any Merchant or the quality of the goods they provide.



13.8 Force Majeure: Bodega+ will not be liable for any delays or failure in performance of any part of the Service, from any cause beyond our control. This includes, but is not limited to: acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, network infrastructure failures, strikes, or shortages of transportation facilities, fuel, energy, labor, or materials.



13.9 Contact Information: If you have any questions about these Terms or need to contact us for any reason, you can reach us at:

Bodega+ Support – Email: support@bodega-plus.com

Mailing Address: Bodega+ Inc., 1234 Biscayne Blvd, Miami, FL 33131, USA (Attn: Legal Department)

By using the Bodega+ Platform, you acknowledge that you have read, understood, and agree to these Terms of Service. Thank you for choosing Bodega+ for your food and beverage needs!

Bodega+ Privacy Policy



Last Updated: February 26, 2025



Bodega+ (“we”, “us”, or “our”) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how Bodega+ collects, uses, shares, and safeguards information in connection with our services, including our mobile application and website (collectively, the “Platform”). It also describes your choices and rights regarding your personal data. By using the Bodega+ Platform, you consent to the data practices described in this Policy. If you do not agree with these practices, please do not use our services.



This Privacy Policy is intended to be compliant with applicable privacy laws in the United States, including the California Consumer Privacy Act (CCPA) as amended by the CPRA, and to inform users from other jurisdictions (including the European Economic Area) of relevant practices. If you have any questions or concerns about this Policy, please contact us using the information provided in Section 7.



1. Information We Collect



We collect various types of information from and about users of our Platform, including personal information (data that can be used to identify you) and non-personal information. We obtain this information in three main ways: (a) information you provide to us directly; (b) information we collect automatically through technology when you use our Platform; and (c) information we receive from third parties. We limit our collection to information that is relevant for providing our services and improving your experience.



1.1 Information You Provide Directly: When you interact with Bodega+, you may provide certain information to us, such as:

• Account Registration Information: When you create a Bodega+ account, we ask for personal information like your name, email address, phone number, and a password. If you register using a third-party account (like Google or Facebook), we receive your name and email from those services as permitted by their privacy policies.

• Profile and Preferences: You may choose to provide other profile details such as a profile photo, saved delivery addresses, dietary preferences, or favorite restaurants. These are optional and are meant to enhance your experience (for example, to show you targeted offers that match your cuisine preferences).

• Order Information: When you place an order, we collect details related to the order, such as the items purchased, special instructions or preferences (e.g., extra sauce, no nuts), the date and time of the order, and any delivery or pickup details (like your delivery address or chosen pickup location).

• Payment Information: To pay for orders, you provide payment card details (credit/debit card number, expiration date, CVV) or other payment method details. This information is processed by our third-party payment processor (Stripe). Bodega+ itself typically only stores a “token” or reference provided by Stripe to indicate your payment account, along with billing name and address. We do not store your full card number or CVV on our servers. (See Section 3.1 on how Stripe handles this information.)

• Communications and Support: If you contact us directly (e.g., via customer support requests, emails, or phone calls), we will receive the content of your messages and any additional information you choose to provide. For example, if you report a problem with an order, you might share details or photos related to the issue.

• Feedback, Reviews, and Surveys: You might provide information when you respond to surveys, submit feedback, or post reviews of merchants. This can include opinions, experiences, preferences, and any personal information you choose to include in such submissions.

• Referral or Gift Program Information: If you participate in a referral program, you might provide the contact information of friends (e.g., email or phone number) to send them an invite or gift. Please only provide contact details of individuals with whom you have a personal or family relationship and who would want to receive the referral message.



1.2 Information We Collect Automatically: When you use our Platform, we (or our service providers) automatically collect certain information about your device and usage of the Platform through cookies, web beacons, and other tracking technologies. This information may include:

• Device and Technical Data: Such as your device type (phone, tablet, desktop), operating system and version, unique device identifiers (like IDFA or Android Advertising ID), browser type, screen resolution, and IP address.

• Usage Data: We log usage information such as the dates and times you access the Platform, the pages or screens you viewed, how long you use the app, search queries you enter, features you interact with (e.g., scanning through a menu, viewing a promotion), and the referring webpage or app (if you clicked a link to our Platform).

• Location Data: If you enable location services on your mobile device and grant permission for the Bodega+ app to access it, we may collect precise geolocation information. This can help us show you nearby merchants or relevant deals. You can always choose to disable location permissions in your device settings; if you do, we may approximate your location based on your IP address or the address you enter for an order.

• Transaction Data: We automatically record details of transactions on the Platform, such as order ID, order amount, the Merchant involved, and time and date of the transaction.

• Cookies and Similar Technologies: We use cookies (small data files stored on your browser or device) and similar technologies (such as SDKs in our mobile app or pixels in emails) to collect information and improve our services. For example, cookies help us recognize you when you return, keep you logged in, remember your preferences, and understand which parts of our Platform are popular. They also help with marketing (like showing you relevant ads). For more details, see Section 2.4 below (Cookies and Tracking Tech).



1.3 Information from Third Parties: We may receive information about you from other sources, for example:

• Merchants: If you interact with a Merchant (for example, you join a Wi-Fi network at a cafe or participate in a Merchant’s in-house loyalty program that ties into Bodega+), that Merchant might provide us with information to enhance our joint services. This could include verification that you redeemed a Bodega+ deal in-store, or updates about the status of an order.

• Social or Sign-in Services: If you register or log in via a third-party platform (like Google Sign-In, Apple Sign-In, or Facebook Login), those services may send us information such as your name, profile picture, and email address, as authorized by you via those services. We use such information to streamline account creation and login. We do not post anything to your third-party accounts without your permission.

• Referral Programs: If someone refers you to Bodega+, we may receive your contact information from that person. We will use it only for the purpose of sending you the referral invitation or initial message (unless you subsequently create an account and provide more information). If you believe one of your contacts provided us your information and you do not want to be contacted, please email us at privacy@bodega-plus.com.

• Marketing Partners & Analytics Providers: We might receive aggregate demographic or interest data from third-party analytics firms or advertising partners that helps us understand our user base and improve our marketing efforts. This data is generally not identifiable to you personally (e.g., it might tell us that a certain percentage of our users are interested in vegetarian food, or that users who like coffee shops also tend to order desserts, etc.).

• Public Sources: We may also collect information that is publicly available. For example, we might collect information from public social media profiles (to the extent allowed by those platforms’ terms) if we run a promotional event and you publicly tag or mention us.

• Combined Information: We may combine the information we receive from the above sources with information we collect directly and automatically for the purposes described in this Privacy Policy.



2. How We Use Your Information



Bodega+ uses the information we collect for various purposes necessary to run our service, to improve your experience, and to communicate with you. We commit to using personal information in a lawful, fair, and transparent manner. The primary uses of information are:



2.1 To Provide and Operate the Service:

• Order Processing: We use your information to facilitate transactions you request. For example, we use your order details and preferences to inform the Merchant what you ordered, your name for the order, and if it’s delivery, your address or location. We use your payment information to charge you for your purchases.

• Account Management: We maintain your account and preferences, such as saving your delivery addresses, order history (so you can re-order easily or review past purchases), loyalty points balance, etc. We also use your login credentials to authenticate you when you sign in.

• Communications About Orders: We send you communications to update you on the status of your orders (e.g., order confirmation, ready for pickup notification) or if an issue arises (such as a delay or item availability issue). We may also facilitate communication between you and the Merchant when necessary – for instance, if a restaurant needs to clarify an order detail, we might pass a message to you via the app or contact you with the phone number you provided.



2.2 To Improve and Customize Your Experience:

• Personalized Content and Recommendations: We analyze your interactions, order history, and preferences to provide customized offers and recommendations. For example, if you frequently order coffee, we might highlight new cafes or coffee deals in your area. Or we may tailor the home screen to show your favorite cuisines first. This personalization helps make the Platform more relevant to you.

• Loyalty and Rewards: We track your purchases and engagement in order to calculate loyalty points and determine reward eligibility. For example, if our loyalty program offers a free item after 10 purchases, we use your transaction history to know when you’ve hit that threshold and then notify you of your reward.

• To Develop New Features: Information about how users navigate and use our Platform (collected via cookies, logs, and feedback) helps us identify areas to improve. We might use this data to develop new app features, improve the user interface, or introduce new services. For instance, if we notice many users searching for a particular type of cuisine that we have few merchants for, we might prioritize adding new merchants in that category.

• Analytics: We use analytics tools to understand usage patterns and trends. This includes measuring how users respond to various features or campaigns. These insights are typically in aggregated form (e.g., overall app usage metrics, feature popularity) and help us make data-driven decisions.



2.3 To Communicate with You:

• Service Communications: We will send you administrative or account-related messages such as confirmations of actions (e.g., confirmation of account creation or changes to your account settings), important updates about the Platform (like changes to our Terms or Privacy Policy), or customer service messages in response to your inquiries. These are not promotional in nature, and you cannot opt out of receiving these essential communications while you have an active account (except by deleting your account).

• Marketing and Promotional Communications: With your consent or as otherwise permitted, we may send you newsletters, special offers, promotions, surveys, or other marketing communications to inform you of new merchants, exclusive deals, or loyalty incentives. These may be tailored to your preferences and past orders (targeted offers). For example, we might email you a discount code for a restaurant if we see you haven’t ordered in a while, or notify you of a promotion at a bar you’ve visited through Bodega+. You can unsubscribe from marketing emails at any time by clicking the “unsubscribe” link in the email, and you can manage push notification preferences in the app settings. (See Section 4.2 for your choices).

• Referral and Incentive Communications: If you’re part of our referral program, we may send communications to your referees as needed (for example, the initial invite or a reminder if allowed). If someone has referred you, we may send you a message about joining Bodega+. We also might notify you when you earn a referral reward or when an influencer you follow shares a new promo (if you have subscribed to such notifications).



2.4 For Advertising and Marketing (Targeted Offers):

• Targeted Advertising: We use data about you to deliver targeted advertising (on our Platform and on third-party sites/apps) that is more likely to be relevant to your interests. For example, we might work with advertising partners (like social media platforms or ad networks) to show you ads for Bodega+ deals or new features, based on information like your general location, your past purchases, or demographic segments. If you’ve looked at certain merchants on Bodega+, you might see ads for those or similar merchants on other websites (this is often done through cookies or mobile ad IDs). These ads may be tailored using profiling techniques, but note that we do not share information that directly identifies you (like your name or email) with third parties for advertising purposes without your consent. We may use hashed identifiers or anonymous data to match you with audiences on other platforms. (See Section 5.2 for more on third-party advertising cookies and your opt-out options.)

• Promotions and Surveys: We may use your contact info to send you promotional communications (as described above) or invite you to participate in surveys or contests. Participation in surveys or contests is voluntary. Information collected in those contexts may be used to administer the promotion, analyze results, or award prizes.

• Influencer and Social Media Marketing: If you interact with our social media pages or participate in our influencer campaigns, we might use any public information from your profile or your interactions (like commenting on a post) to repost or respond as part of our community engagement. We will always handle such interactions in line with the platform’s terms and expectations.



2.5 To Ensure Security and Prevent Fraud:

• Account and Order Security: We monitor accounts and transactions for suspicious or fraudulent activity. If we detect something unusual (like a log-in from a new location, or an unusually large order that looks out of character, or multiple accounts linked to the same device showing signs of fraud), we may use information to investigate and mitigate potential fraud. This could involve contacting you for verification, using automated systems to flag or block accounts, or working with law enforcement if needed.

• Policy Enforcement: Information is also used to enforce our Terms of Service and other policies. For instance, if we have banned a user for misconduct, we may retain certain information (like device ID or email) to prevent them from creating a new account in violation of the ban. We also use data to prevent referral abuse (as described in the Terms) by checking for things like duplicate accounts or other indicators of cheating the system.

• Legal Compliance: We may process your information as required by applicable law, legal process, or regulation. For example, keeping records of transactions to comply with financial regulations, or responding to valid legal requests for data (as detailed in Section 3.3).



2.6 Other Legitimate Business Purposes:

We may use non-personal or aggregated information for any purpose, as this information does not identify specific individuals. For example, we may generate statistical reports like “X% of our users live in cities with populations over 1 million” or “the average number of orders per active user per month”. This helps us understand and improve our business.

If we need to use your personal information for a purpose not described in this Privacy Policy, we will notify you and obtain your consent if required by law.



Legal Bases for Processing (EEA/UK Users): If you are in the European Economic Area or the UK, we process your personal information on the following legal bases:

• To perform our contract with you (Article 6(1)(b) GDPR), such as processing orders and payments.

• For our legitimate interests (Article 6(1)(f)), such as improving the service, preventing fraud, and sending marketing (where not consent-based), which we have balanced against your data protection rights.

• With your consent (Article 6(1)(a)), for example, for sending promotional communications or using precise location data for recommendations, where such consent is required. You can withdraw consent at any time.

• To comply with legal obligations (Article 6(1)(c)), like maintaining records for tax purposes or honoring consumer privacy rights requests.



3. How We Share Your Information



Bodega+ understands the importance of keeping your personal information private. We do not sell your personal data to third parties for money. However, in the normal course of providing our services, there are instances where we need to share your information with others. This section describes what information we share, with whom, and why.



3.1 Sharing with Merchants:

When you place an Order or otherwise interact with a Merchant via Bodega+, we share necessary information with that Merchant to fulfill your order or request. This includes:

• Order Details: The Merchant will see the contents of your order (e.g., the items and quantities), any special instructions or preferences you noted, and timing details (like scheduled pickup time).

• Your Name and Contact: For pickup orders, we share your first name and possibly last initial so the Merchant can label your order. For delivery orders, Merchants (or their delivery personnel) will see the name and delivery address you provide, and your phone number if necessary to coordinate delivery. They may also see your general order history with them if needed (for example, to assist with loyalty reward validation or to identify habitual issues).

• Anonymized Payment Info: Merchants do not receive your credit card info. They will see that the order was paid via Bodega+, the total amount, and any tip amount you added for them, but your actual payment details remain with us and our payment processor.

• Communications: If the Merchant needs to contact you about your order (e.g., an item is out of stock or they have a question), we facilitate that communication. They might call you at the number provided or send a message through the Platform. We ask Merchants to use your information solely for order-related communication.

• Merchants are independent data controllers for the information they receive. This means that while we contractually require them to only use the information for fulfilling orders and not for other purposes (like their own marketing, unless you separately gave them info and consent in-store), the Merchant has its own legal obligations for the data. If you have questions about a Merchant’s privacy practices (for example, how they store your data from orders), you would need to contact that Merchant directly.



3.2 Sharing with Service Providers (Processors):

We employ trusted third-party companies and individuals to help us operate, provide, and improve our services. These service providers perform tasks under our direction and on our behalf, and they are bound by contractual obligations to keep personal information confidential and to use it only for the purpose of providing their services to Bodega+. Key examples include:

• Payment Processors: As noted, we use Stripe for payment processing. Stripe will process your payment details (card number, expiration, etc.) securely. Stripe is a third-party processor that has its own privacy and security practices. We share with Stripe the purchase amount and identifying information needed to charge your card and route payments to Merchants. See Stripe’s Privacy Policy for more information on their practices. (Note: By using Bodega+, you are also agreeing to Stripe’s terms to the extent necessary for payment processing.)

• Cloud Hosting and Infrastructure: Our Platform is hosted on cloud servers (for example, Amazon Web Services or similar providers). This means data you provide is stored and processed on their servers. They provide the physical or cloud infrastructure but do not access your data except as needed for maintenance of the service.

• SMS/Email Delivery Services: We use services to send out emails, text messages, or push notifications (for example, an email service like SendGrid or a texting gateway for SMS). They handle the transmission of those communications to you. They will have access to your contact info for that purpose only.

• Analytics and Crash Reporting: We might use analytics tools (like Google Analytics for Firebase, or other analytics SDKs) and crash reporting services to understand app performance and stability. These tools may automatically collect technical data and usage info (some of which could be considered personal data like device ID or IP). However, this data is generally aggregated and not used to identify individual users by these providers.

• Marketing and Advertising Partners: We may share limited personal data with marketing service providers who help us with campaign management, email marketing, or advertising. For example, if we use a platform to manage email distribution, your email and name might be loaded into their system. Or if we do re-targeting ads on social media, we might provide a hashed version of your email or phone number to the social platform to find matching accounts (to show our ads to). These partners are obligated to not share your info and to only use it to provide services to us. Some advertising partners might act as separate data controllers (see Section 5 for more on advertising).

• Referral and Loyalty Program Vendors: If we utilize third-party software or services to manage referrals or loyalty rewards (for example, a platform that tracks referral codes or points on our behalf), we will share the necessary info with them (such as your user ID, points balance, or referral code usage) to operate those programs.

• Customer Support Tools: If you interact with our customer support, the communications may go through a support ticketing system or CRM that stores conversation history and contact info to help our support agents assist you.



We limit the personal data shared with service providers to only what is necessary for them to perform their functions. For instance, a delivery SMS provider doesn’t get any of your info except the phone number and message content needed to send you a delivery text.



3.3 Legal and Safety Reasons:

We may disclose information about you if we believe in good faith that such disclosure is necessary to:

• Comply with the law or valid legal process: This includes responding to subpoenas, court orders, warrants, or other legal requests for information from government authorities or involved in a legal proceeding. If allowed, we will attempt to notify you of such requests (for example, via email to the address on file) before disclosing your info, unless we are legally prohibited or believe doing so would be futile or increase risk.

• Enforce our Terms and policies: If necessary, we will share data in connection with an investigation or action regarding violations of our Terms of Service or other policies (e.g., to address credit card fraud, or misuse of our Platform).

• Detect or prevent fraud and security issues: This could involve sharing information with other companies or organizations (including law enforcement) for fraud prevention, spam/malware protection, or similar purposes. For example, if we detect a pattern of fraud that also affects another app, we might share relevant data with that other app for mutual protection under appropriate agreements.

• Protect rights, property, and safety: We may share information to protect the rights, property, or personal safety of Bodega+, our users, our Merchants, or the public. For instance, if a user’s communications on the platform threaten harm, we might share information with appropriate authorities.



These types of disclosures are made notwithstanding anything to the contrary in this Policy. We will limit the scope of data disclosed to only what is necessary to meet the specific legal or safety purpose.



3.4 Business Transfers:

As we continue to develop our business, we might buy or sell assets or business units. We may share or transfer user information in the event of a corporate transaction such as:

• Merger or Acquisition: If Bodega+ (or its parent company) is involved in a merger, acquisition, due diligence process, reorganization, or sale of assets, your information may be transferred as part of that deal. We will ensure the acquiring entity is bound to respect your personal information in a manner consistent with this Privacy Policy.

• Financing or Investors: In the course of seeking investment or financing, we may share aggregated statistics or anonymized user information as part of business presentations. If any personal data is to be shared for these purposes, we will ensure it is protected under non-disclosure agreements.

• Insolvency or Bankruptcy: In the unlikely event of bankruptcy or receivership, information may be considered an asset subject to transfer or sale. We would seek to ensure the protection of personal data in such processes.



If a business transfer results in a material change in how your personal information will be handled, we will notify you (for example, via an update to this Policy and possibly an in-app notification or email) and you will have choices as provided by law.



3.5 With Your Consent:

Apart from the situations described above, we will request your consent before sharing your personal information with third parties in cases where it would otherwise not be permitted. For example, if we ever wanted to post a customer testimonial on our site with your name or wanted to share your contact info with a partner for their own marketing (not something we do in the ordinary course), we would only do so with your explicit consent. If you direct us to share information with a third party (for instance, if you integrate Bodega+ with another service or ask us to export your data to a third-party app), we will do so under your direction and that is also considered consent.



3.6 De-identified or Aggregated Data:

We may share information that has been aggregated or de-identified (so it cannot reasonably identify you as an individual) with third parties freely, since this data is not personal information. For example, we might share statistics like “50% of our users purchase coffee at least once a week” or “demand for ice cream orders increased 30% this summer” with industry partners or in marketing materials. Such information will not contain anything that could be linked back to any specific user.



3.7 Sharing Regarding Referral or Social Features:

If our Platform offers features that allow you to share content with others (such as sending an order summary to a friend, or posting about your purchase on social media), obviously in those cases you are choosing to share that information and it may be visible to the recipients or others depending on what you do. Once you share information in that manner, Bodega+ cannot control how the recipients or third-party platforms further use or disclose that information. Please exercise caution when using social sharing features.



In all cases of data sharing, we aim to ensure that your personal information is treated securely and in accordance with this Privacy Policy and applicable laws. We do not sell personal information to data brokers or telemarketers. We do not share user contacts without reason, and we do not allow Merchants to use data received from Bodega+ for any purpose other than fulfilling your orders (unless you separately establish a relationship with that Merchant outside the platform, such as joining their own mailing list).



4. Your Choices and Rights



We believe it is important that you have control over your personal information. Depending on your location and the nature of your interactions with Bodega+, you may have certain privacy rights and choices. This section outlines various ways you can manage your information with us:



4.1 Accessing and Updating Your Information:

• Profile and Account Info: You can access and update much of your account information directly in the Bodega+ app or website by logging in to your account settings. Here, you can edit your name, contact details, saved addresses, payment methods, and other profile information. It’s important to keep your information up-to-date (especially contact and payment information) for smooth service.

• Order History: Your account page will display your past orders. While you cannot edit past order records, you can view the details. If you believe any order in your history is incorrect, contact support for assistance.

• Communications: In your account settings, you may find preferences for communications. For example, you can opt in or out of receiving certain types of push notifications.



4.2 Marketing Communications Preferences:

• Email: If you no longer want to receive marketing or promotional emails from Bodega+, you can click the “unsubscribe” link at the bottom of any marketing email we send. This will remove you from our marketing mailing list (though you will still receive transactional emails related to orders or account activity).

• SMS: If you’ve opted to receive promotional SMS messages (text messages) from us, you can opt out at any time by replying “STOP” to any such message. Note that if you STOP, you may still receive texts that are strictly transactional (e.g., verification codes, or a delivery notification) if you continue to use the service.

• Push Notifications: If you previously enabled mobile push notifications for deals or updates, and you wish to stop receiving them, you can turn off notifications for the Bodega+ app in your device’s settings, or adjust the preferences within our app if available. Keep in mind, disabling push notifications might also disable order status notifications on your device.

• In-App Promotions: We may show in-app banners or messages about promotions. Currently, these are part of the app experience and can be dismissed but not entirely disabled except by opting out of marketing via contact with support. However, they are typically generic or targeted based on in-app logic rather than personal data in a way regulated as “selling” data.



4.3 Do Not Track Signals:

“Do Not Track” (DNT) is a privacy preference that users can set in some web browsers to signal that they do not want their online activity tracked. At this time, Bodega+’s website does not respond to DNT signals in a uniform or predictable manner, because there is not yet a consensus on how companies should interpret them. We treat the data of all users in accordance with this Privacy Policy, and if you want to opt out of certain tracking (like analytics or advertising cookies), you can do so as described in Section 5.2 below (Cookies and Advertising choices).



4.4 Location Information:

If you initially consent to share precise location data via the app and later change your mind, you can withdraw that permission by changing the settings on your mobile device (for example, set location sharing for Bodega+ to “Never” or “Ask next time”). If you do so, note that location-based features (like finding nearby deals or automatic address suggestions) may be limited. You can still manually input your address or search for locations.



4.5 Cookies and Tracking Technologies:

We provide details in Section 5 about how to manage cookies and other trackers. You can usually modify your browser settings to refuse some or all cookies, or to alert you when cookies are being set. Additionally, various ad industry tools allow you to opt-out of targeted advertising. See Section 5.2 for more information on cookie choices and controlling personalized ads.



4.6 Account Deletion:

• If you wish to close your Bodega+ account and have your personal data deleted, you may do so by contacting us at privacy@bodega-plus.com or through the account deletion option in the app (if available). We will process such requests in accordance with applicable law. Note that after deletion, you will not be able to log in or access any of your prior information. In some cases, we might retain certain information after account deletion where allowed or required (see Data Retention in Section 6).

• California residents and users from certain other regions have a right to request deletion of their personal information under applicable law. Account deletion as described is the primary way to fulfill that; we may ask you to confirm such a request and to verify your identity (for example, by providing information that matches our records).



4.7 Privacy Rights for Specific Regions:

• California Residents: If you are a California resident, you have specific rights under the CCPA/CPRA, including the right to know what personal information we have collected about you in the past 12 months, the right to request deletion of your personal information, the right to opt-out of “sale” or “sharing” of your personal information (if applicable), and the right not to be discriminated against for exercising your privacy rights. Please see Section 8.1 below for more details on California rights and how to exercise them.

• Nevada Residents: Nevada law allows Nevada residents to opt-out of certain types of personal data sales. However, Bodega+ does not sell personal data for monetary consideration as defined in Nevada law. If that changes, we will update this Policy and provide a method to opt-out.

• EU/EEA/UK Residents: If you are in the European Union, UK, or similar jurisdictions, you have rights under the GDPR or local laws, which include: the right of access (to receive a copy of data we hold about you), the right of rectification (correct inaccuracies), the right to erasure (delete your data, a.k.a “right to be forgotten”), the right to restrict processing, the right to data portability, and the right to object to certain processing (like direct marketing or when we process under legitimate interests). To exercise these rights, you can contact us (see Section 7 for contact info). We may need to verify your identity and request before executing certain requests. We will respond within the timeframes required by law. Some rights may be limited if fulfilling them would interfere with legal obligations (for example, we might not delete data we are required to keep for legal tax reporting).

• Other Regions: If you are in a jurisdiction with comprehensive privacy laws (such as Canada, Brazil, etc.), you may have similar rights. We aim to honor all valid requests to the extent required by applicable law. You can reach out to us with your request, and we will clarify what we can do.



4.8 Authorized Agents: (California) If you are making a privacy request on behalf of someone else (e.g., you are an authorized agent or a legal guardian), we will require proof of your authority to act on behalf of that individual and also verify the identity of the subject of the request. For example, if an authorized agent submits a deletion request for a user, we might require a signed authorization letter from the user or a power of attorney, and we will attempt to verify the user’s identity directly.



4.9 Opt-Out of Targeted Advertising/Sharing:

As described, we do not sell personal information for money. However, the use of certain advertising cookies or tools might be considered a “share” of personal information for cross-context behavioral advertising under laws like CPRA. If you are a user in a jurisdiction giving you the right to opt out of such sharing (like in California, the right to opt-out of targeted advertising), you can exercise that by using the cookie opt-outs described in Section 5.2 or by contacting us at privacy@bodega-plus.com with your request. We are working on implementing a more streamlined “Do Not Sell or Share My Personal Information” link or setting for California users; in the meantime, contacting us will initiate the process.



4.10 Limit Use of Sensitive Personal Information:

Bodega+ does not seek to collect sensitive personal information (such as Social Security numbers, driver’s license numbers, financial account passwords, precise geolocation beyond what is needed for service, health info, or racial/ethnic data, etc.) except for basic identifiers and payment info necessary for transactions. To the extent we collect any data that is considered “sensitive” under certain laws (for example, precise geolocation might be considered sensitive in California law), we only use it for providing the services requested (e.g., finding nearby merchants or delivering an order to your precise location). We do not use or disclose sensitive information for purposes that require offering a right to limit under CPRA. If in the future we contemplate new uses of sensitive info, we will update you and provide relevant controls.



4.11 Additional Choices:

• Third-Party Accounts: If you linked your Bodega+ account with a third-party service (like Google or Apple sign-in), you can disconnect that through your account settings on our Platform or the third-party’s settings. Note that doing so will not delete data already obtained; to delete your Bodega+ account, follow 4.6 above.

• Non-Users: If someone who is not a Bodega+ user believes we have their personal information (perhaps via a referral or because a friend shared their info), and wants to request deletion, they can contact us at privacy@bodega-plus.com. We will handle such requests as required.

• In-App Permissions: The mobile app may ask for various permissions (camera for scanning a QR code, contacts if you want to invite friends, etc.). You can always decline these permissions or change them in your settings, though functionality might be limited.



Please note: We will never discriminate against you for exercising any of your privacy rights. For example, if you opt-out of marketing emails, we will not reduce your loyalty points or refuse service to you. However, some features require certain data to function. If you request deletion of all your data, you will no longer be able to use the Platform (since we need to process orders, payments, etc.). We will always try to accommodate privacy requests in a way that balances individual rights with our ability to provide a secure, high-quality service to all customers.



5. Cookies and Tracking Technologies



Bodega+ and our third-party partners use cookies and other tracking technologies to provide and optimize our services, as well as to deliver targeted advertising. This section explains what these technologies are and how you can manage them.



5.1 What Are Cookies and Similar Technologies?

• Cookies: Cookies are small text files placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide reporting information. Cookies set by Bodega+ (the site owner) are called “first-party cookies.” Cookies set by parties other than Bodega+ are called “third-party cookies.” Third-party cookies enable features or functionality provided by third parties (such as analytics, advertising, or social media integration) to be used on or through the website.

• Pixel Tags and Web Beacons: These are tiny graphics files containing a unique identifier that are embedded in emails or on web pages. They are used to count ad impressions or email opens, verify certain information, and gather usage data.

• Mobile Identifiers: In mobile apps, we don’t use cookies, but we may use device identifiers (like Apple’s IDFA or Android’s Advertising ID) and SDKs (software development kits) integrated in the app to accomplish similar tracking purposes.

• Local Storage: The Bodega+ app or site may use local storage or session storage in your browser or device to store data (similar to cookies).



5.2 How We Use These Technologies:

• Essential Cookies: These are necessary for our website or app to function properly. For example, they allow you to log in, keep your session active, and load basic features. Without these, the service you have requested (such as remembering items in your cart or keeping you logged in during your session) cannot be provided. Because they are essential, you cannot opt-out of these cookies (other than by not using the service or clearing your cookies after use).

• Analytics Cookies: We use these to collect information about how users interact with our Platform, such as which pages are visited, how long is spent on the site, and any issues (like error messages). This helps us improve the performance and design of our service. For example, we might use Google Analytics or similar tools that use their own cookies to track site interactions. The information collected is usually aggregated and does not directly identify individuals. You can opt out of Google Analytics by installing a browser add-on (available at tools.google.com/dlpage/gaoptout) or by managing cookies as described below.

• Functionality Cookies: These cookies allow our site to remember choices you make and provide enhanced, more personalized features. For instance, saving your language preference or remembering your previously viewed merchants. They may be set by us or third-party providers whose services we have added to our pages. While you can disable them, doing so might make some features less convenient or functional.

• Advertising Cookies / Targeting Cookies: Bodega+ and our advertising partners use these cookies to deliver advertisements that are relevant to you and your interests, both on our Platform and on other sites or apps. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, selecting advertisements based on your interests, and measuring the number of ads displayed and their performance (e.g., whether you clicked on an ad). For example, if you visit our site and then go to a different site, you might see an ad for Bodega+ on that site – this is enabled by targeting cookies that our ad network partners set.

• Social Media Cookies: Our website might integrate with social media platforms (like a Facebook “Like” button or an option to share via Twitter). If you click those, the social platform may set a cookie on your device. These cookies might collect your IP and the page you are visiting, and could link that info to your profile on their platform. We don’t control these cookies; they are set by the social media networks themselves.



5.3 Your Choices for Cookies:

• Browser Settings: Many web browsers allow control of most cookies through their settings preferences. You can typically set your browser to notify you when a cookie is being set or updated, or to block cookies altogether. Each browser is a bit different, but common methods include:

• Chrome: Settings > Privacy and Security > Cookies and other site data.

• Safari: Preferences > Privacy > Cookies and website data.

• Firefox: Options > Privacy & Security > Cookies and Site Data.

• Edge/Internet Explorer: Settings > Privacy & security > Cookies.

Keep in mind, disabling cookies entirely may impact the functionality of many websites, including ours. For example, if cookies are disabled, you might not be able to log in or use some interactive features.

• Cookie Banner/Preference Center: On our website, we may display a cookie consent banner when you first visit, especially if required by law. This banner allows you to accept or reject non-essential cookies (like analytics and advertising cookies). If available, you can use our Cookie Preference Center to adjust your settings at any time. There might be a link on our site like “Cookie Settings” or similar where you can revisit and change your preferences.

• Opt-Out of Targeted Ads: Beyond cookies, you can opt out of targeted advertising in several ways:

• Network Advertising Initiative (NAI): Visit the NAI opt-out page (http://optout.networkadvertising.org) to see a list of third-party ad networks and opt out of interest-based advertising from any or all of them.

• Digital Advertising Alliance (DAA): Use the DAA’s WebChoices Tool (http://optout.aboutads.info) for web-based advertising opt-outs, or the DAA’s “AppChoices” app for mobile (available through app stores) to control interest-based ads in mobile apps.

• Your Ad Choices on Social Media: Platforms like Google, Facebook, and Twitter have settings in your user account for adjusting ad preferences. For example, Google Ads Settings (adssettings.google.com) allows you to opt out of personalized ads on Google and its partners. Facebook’s Ad Preferences panel lets you manage whether you see ads based on data from partners.

Note: Opting out of targeted advertising does not mean you will no longer see advertisements. It means the ads you see will be less tailored to you. You may continue to see generic or contextual ads (for example, an ad that is shown to all users reading a certain news article, rather than one targeted specifically to you based on your browsing behavior).

• Mobile Advertising IDs: On mobile devices, you can usually limit ad tracking via your device settings:

• On iOS: Go to Settings > Privacy > Advertising > toggle “Limit Ad Tracking” (for older iOS) or in newer iOS versions, you can find it under Settings > Privacy > Tracking and also Reset Advertising Identifier if needed.

• On Android: Settings > Privacy > Ads > enable “Opt out of Ads Personalization.”

This doesn’t stop ads from appearing but does notify apps not to use your ID for building profiles for ad targeting.



5.4 Do Not Sell/Share My Info (California specific):

As mentioned, we do not sell personal info in exchange for money. However, California law defines “sale” and “sharing” broadly. If our use of certain advertising cookies or tools is deemed a “sale” or “sharing” of personal info, California residents have the right to opt out. To exercise this, California users can:

• Use the cookie management options and opt-out tools described above (which effectively instruct us and third parties not to use cookies that could be considered a “sale”/“share”).

• Or send us a request via email at privacy@bodega-plus.com indicating you wish to opt-out of any selling or sharing of your personal info. We will honor such requests, likely by implementing cookie or tracking opt-outs and ensuring any offline data sharing for marketing is ceased.



5.5 Analytics and Third-Party Tools:

We use tools like Google Analytics, as noted. Google Analytics may set cookies or use device identifiers to collect usage data. Google provides an opt-out mechanism (mentioned above). We may also use other analytics or operational tools like Firebase Crashlytics or Mixpanel; these are used purely to improve service reliability and user experience.



5.6 Changes to Cookies Over Time:

The specific cookies and trackers we use may change as our Platform evolves and as technology or regulatory guidance changes. We will endeavor to update our cookie disclosures accordingly (for example, listing categories of cookies or key partners in either this Privacy Policy or a separate Cookie Policy on our website).



By using our Platform with cookies enabled in your browser or device (and not opting out through any of the methods above), you consent to our use of cookies and similar technologies as described in this Policy.



6. Data Security and Retention



6.1 Data Security:

We implement a variety of security measures to protect your personal information from unauthorized access, use, alteration, and destruction. These measures include:

• Encryption: We use encryption protocols (such as SSL/TLS) to secure data in transit. For example, when you enter sensitive information (like a credit card number) into our Platform, that data is encrypted during transmission to our servers and to Stripe. We also encrypt certain sensitive information at rest where appropriate.

• Access Controls: We limit access to personal data to employees, contractors, and agents who need such access to operate, develop, or improve our services. They are bound by confidentiality obligations. Our databases are protected by firewalls, and access to those databases requires multiple levels of authentication.

• Security Testing: We periodically review our information collection, storage, and processing practices to guard against unauthorized access. We employ security technologies like intrusion detection systems and may engage third-party security auditors or use bug bounty programs to find and fix vulnerabilities.

• Payment Information: As mentioned, payment card data is processed by Stripe. Stripe is PCI-DSS compliant (a rigorous security standard for payment processors). We do not store full card numbers or CVV codes on our systems. For any payment data we do store (like the last 4 digits of your card for reference, or billing ZIP code), we maintain that in a secure environment.

• Physical Security: For the data centers or cloud services we use, we rely on those providers’ physical security measures. These often include 24/7 monitoring, secure access controls, and redundant infrastructure to protect against outages or disasters.



However, please remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. Cyber threats evolve and no system is completely foolproof. In the unlikely event of a data breach, we have incident response plans to address and mitigate harm, and we will notify affected individuals and authorities as required by law.



6.2 Data Retention:

We retain personal information only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.

• User Accounts: We will keep your account information on file for as long as your account is active. If you choose to delete your account (or if we terminate it per our Terms), we will initiate deletion of your personal information from our systems, except as noted below.

• Order and Transaction Data: We retain records of transactions (orders, payments, payouts to merchants) because these records may be required for financial reporting, audits, and compliance with laws (tax, accounting). Typically, financial records are kept for a minimum of seven years or as required by local law. Even if you delete your account, we may keep order history associated with an anonymized identifier for these purposes, or to be able to address any disputes or chargebacks that arise after account deletion.

• Loyalty/Referral: If you have unused loyalty points or referral credits and have not used your account for a long period, we might retain your information to allow you to come back and still have those benefits, but we generally archive or delete dormant accounts after a certain number of years of inactivity (we will notify you before doing so if required).

• Communications: We may retain communications with you (such as emails to support) for a period to ensure we have a history of your requests and how we responded, which can be important for any future queries or legal purposes. These are generally kept for a few years, unless a longer period is required (for example, if a complaint resulted in a permanent ban, we might keep that correspondence to maintain a record of why action was taken).

• Legal Obligations & Disputes: If we are under a legal obligation to retain data (for example, due to a subpoena or ongoing investigation), or if data is needed for resolving a dispute, we will retain the specific data as necessary until that obligation is fulfilled or the dispute resolved. We may also retain a limited amount of information to prevent fraud or future abuse – for instance, if an account was banned for fraud, we might retain certain info like device identifiers or email to enforce the ban.



Once retention periods expire and we have no further legitimate need or legal obligation to retain your data, we will securely delete or anonymize your personal information. Anonymization is an alternative to deletion whereby we remove personal identifiers so that the data can no longer be linked to any individual. We might do this to preserve aspects of the data for statistical analysis (like order volume trends) without retaining anything that identifies users.



6.3 International Data Transfers:

Bodega+ is based in the United States. If you are accessing our Platform from outside the U.S., be aware that your information will likely be transferred to, stored, and processed in the United States (and possibly other countries where our servers or our service providers are located). U.S. data protection and privacy laws may not be as protective as those in your home country. However, we take steps to ensure that your personal information receives an adequate level of protection:

• For personal data from the EEA, UK, or Switzerland, we may rely on EU Standard Contractual Clauses or other legally approved transfer mechanisms to ensure lawfully permitted data transfers. We also ensure U.S. service providers handling such data commit to compliance frameworks as needed by law.

• By using our services, or providing us with your information, you consent to the transfer of your personal information to the United States (and potentially other jurisdictions as explained) and the use and disclosure of information about you as described in this Privacy Policy.

• If you do not want your data transferred to the U.S., please do not use the Platform. You may contact us for any questions about cross-border data transfers.



6.4 Data Storage:

We may use cloud storage provided by third parties (such as AWS, Google Cloud, or Azure). We typically choose reputable providers that offer strong security protocols. Data stored in the cloud is often replicated across multiple locations for redundancy. While this improves availability and disaster recovery, it can mean your data could be stored in data centers located in multiple regions (all under the umbrella of our cloud provider’s security controls). Our agreements with these providers include commitments to confidentiality and security of your data.



6.5 Protecting Children’s Data:

The security and privacy of minors’ data is particularly important. As stated in Section 8.2 below (Children’s Privacy), our services are not directed at children under 13, and we do not knowingly collect personal data from them. If we learn that we have inadvertently stored personal information of a child under 13 (or under 16 in certain jurisdictions with stricter rules), we will promptly delete such information using the most secure methods available (like secure erasure or destruction of records). If a parent or guardian believes their child has provided personal information to us, they can contact us to request deletion.



6.6 Breach Notification:

In the unfortunate event of a data breach that affects your personal information, Bodega+ will act promptly to contain and investigate the breach. We will notify any affected individuals and relevant authorities as required by law. Such notification may occur via email, app notification, or posting a notice on our website, depending on legal requirements and what is deemed the most effective way to reach you. We may also provide credit monitoring or identity theft protection services if recommended and appropriate, though we aim to prevent breaches from occurring in the first place through our proactive security measures.



7. Contact Information



We welcome your questions, comments, and concerns about privacy. If you have any questions about this Privacy Policy or Bodega+’s data practices, or if you would like to exercise your privacy rights (as described in Section 4), please contact us:



Email: privacy@bodega-plus.com

Postal Mail:

Bodega+ Privacy Team  

1234 Biscayne Blvd, Suite 500  

Miami, FL 33131  

United States

(Please include “Attn: Privacy” in the address so it can be directed appropriately.)



Phone: We currently provide email as the primary contact method for privacy inquiries to ensure clear documentation of your request. If you would prefer to speak by phone, you can email us your contact number and a brief description of your concern, and we can arrange a call.



We will do our best to respond to your inquiry within a reasonable timeframe. If you are contacting us to exercise a specific privacy right, please provide sufficient detail that allows us to verify your identity and understand the request. For example, if you want a copy of your data, specify what data you are seeking. If you are a California resident making a request under CCPA, please mention that so we can process it accordingly.



If you have an unresolved privacy or data use concern that we have not addressed satisfactorily, and you are in the United States, you may have the right to lodge a complaint with a supervisory authority, or for example, you can contact the BBB or state Attorney General. In the EU/EEA or UK, you can lodge a complaint with your local data protection authority.



8. Additional Notices



8.1 Notice to California Residents (Your California Privacy Rights):

Under California law (CCPA/CPRA), California residents are entitled to certain disclosures and have specific rights regarding their personal information:

• Categories of Personal Information Collected: In the past 12 months, we have collected the following categories of personal information (as defined by California law): identifiers (such as name, email, phone, address, device IDs); commercial information (orders and transaction history); financial information (payment details via our processor); Internet or other electronic network activity (browsing and app usage data, IP address, cookie IDs); geolocation data; and inferences drawn from the above (like preferences). We do not collect sensitive personal info like Social Security numbers or precise geolocation beyond order-related need.

• Categories of Sources: We obtain this information from you (the user) directly, from your devices (automatically), and from service providers or partners (see Section 1 for details).

• Business Purposes for Collection: These are detailed in Section 2 (“How We Use Your Information”) and include providing the service, marketing, analytics, fraud prevention, etc.

• Disclosure for Business Purposes: We may disclose personal information to service providers and other vendors for business purposes (see Section 3.2). In the past 12 months, we have disclosed identifiers, order info, and usage data to such providers (payment processors, cloud hosting, etc.) to help run our business. These providers are bound by contracts and not allowed to use the info for their own purposes.

• Sale or Sharing of Personal Information: Bodega+ does not sell personal information for monetary consideration. We also do not share personal info for cross-context behavioral advertising except via the use of advertising cookies or similar technologies as described. If such use is considered a “share” under CPRA, you have the right to opt out. As described in Section 5.4, you can opt out of cookies and we will treat that as a request to opt out of “sharing” under California law. We have not knowingly sold or shared the personal info of consumers under 16.

• Right to Know: You have the right to request that we disclose to you the specific pieces of personal information we have collected about you, as well as additional information like the categories of info, sources, purposes, and third parties as outlined above (much of which is provided in this Privacy Policy). Upon verification of your request, we will provide the required information covering the 12 months prior to your request (or longer, as required by law).

• Right to Delete: You have the right to request deletion of personal information we have collected from you, subject to certain exceptions (like if we need to keep it for a legal reason or to complete a transaction you requested, etc.). If you ask us to delete your data, we will also instruct our service providers to delete your info from their records, where applicable. (Note: as explained in Section 4.6, deleting your account will remove most of your info but we may retain some data as allowed by law).

• Right to Correct: Starting January 1, 2023, California law provides a right to request correction of inaccurate personal information. If you believe any personal information we maintain about you is incorrect, you can request that we correct it. Most information (like contact info) you can update yourself via your account, but if there’s something you can’t change, contact us and we will handle it.

• Right to Opt-Out of Sale/Sharing: As noted, we allow opt-out of any data “sharing” for targeted advertising via cookie management or contacting us. We do not sell data for money, but we honor opt-out requests related to any sharing as defined by law.

• Right to Limit Use of Sensitive Information: We do not use sensitive personal info for purposes other than those allowed (we only use potentially sensitive info like precise location for providing the service). Thus, this right is not applicable as we don’t use sensitive info for inferring characteristics, etc.

• Right of Non-Discrimination: We will not discriminate against you for exercising any of your California privacy rights. This means we won’t deny you services, charge you different prices, or provide a different quality of service solely because you exercised your rights. However, do note that if the exercise of your rights limits our ability to process your data (like a deletion request), we may not be able to provide you with certain services (for example, we can’t deliver an order if you’ve asked us to delete your data needed to process orders).

• Submitting Requests: California residents can submit requests for access, deletion, or correction by emailing privacy@bodega-plus.com with the subject line “California Privacy Rights Request” and detailing your request. We will need to verify your identity, which may involve asking you to log in or confirm personal details we have on file. You may also designate an authorized agent to make a request on your behalf by providing a written authorization or power of attorney (we will still require the agent to verify their identity and, if possible, to have you verify that you provided permission).

• Shine the Light: Separate from CCPA, California’s “Shine the Light” law allows residents to request certain information about our disclosure of personal info to third parties for their own direct marketing purposes. We do not share personal info with third parties for their direct marketing unless you’ve separately consented (e.g., if you entered a joint promotion). To make a Shine the Light request, you can contact us as well, but since our policy is not to share for others’ direct marketing without consent, our response will reflect that practice.



8.2 Children’s Privacy:

Bodega+ is not intended for use by children. We do not knowingly collect personal information from children under the age of 13. If you are under 13, do not use or provide any information on our Platform or through any of its features, do not make purchases, and do not provide any information about yourself to us. If we learn that we have inadvertently collected personal data from a child under 13, we will delete that information as quickly as possible. Additionally:

• Teenagers: Users between 13 and 17 (or the age of majority in your jurisdiction) should only use the Platform with permission and involvement of a parent or guardian. We may restrict certain features for users under 18 (for example, ordering alcohol-related items, or participating in certain promotions).

• Parental Controls: Parents/guardians should supervise their children’s online activities. If you believe a child under 13 (or under 16, where applicable law provides additional protections for minors under 16) has provided us personal information, please contact us at privacy@bodega-plus.com so we can investigate and delete the data if needed.

• California Minors: If a California resident under the age of 18 has posted content on our Platform (e.g., a review or comment) that they wish to have removed, they can contact us to request removal. We will then make the content invisible to other users (though we cannot guarantee complete erasure from our systems or backups).



8.3 Third-Party Websites and Services:

Our Platform may contain links to third-party websites or services (for example, a link to a Merchant’s website, or social media pages, or external content). This Privacy Policy does not apply to those external sites or services. Clicking those links may allow third parties to collect or share data about you. We do not control these third-party sites and are not responsible for their privacy practices. We encourage you to read the privacy policies of every website or service you visit. For instance, if you follow a link to a food blog or a delivery partner from our app, any data they collect once you’re on their site is governed by their policy, not ours.



8.4 Changes to this Privacy Policy:

We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. When we make changes, we will post the updated Privacy Policy on our website and update the “Last Updated” date at the top of the Policy. If the changes are significant, we will provide a more prominent notice (such as a banner on our site or an email notification). We encourage you to review this Policy periodically to stay informed about how we are protecting the personal information we collect. Your continued use of the Bodega+ Platform after any changes to this Privacy Policy constitutes your acceptance of the updated terms (to the extent permitted by law). If you do not agree to the changes, you should stop using the Platform and can request deletion of your data.



8.5 International Users:

As noted, if you are using Bodega+ from outside the United States, by providing your information to us you are consenting to the transfer of your information to the U.S. and other jurisdictions as necessary for the purposes described. You understand that your information may be subject to access by law enforcement and governmental authorities in those jurisdictions according to their laws. If you are in a region with data protection laws that differ from U.S. law, we ensure appropriate safeguards for your data as explained earlier. We value all our users globally and strive to provide a consistent level of privacy protection, but certain terms in this Policy primarily address U.S. or California requirements because our operations are U.S.-centric.



8.6 Users in the European Economic Area (EEA), UK, and Switzerland:

While Bodega+ primarily operates in the U.S., if you are using our service in the EEA or UK, the data controller for your personal data is Bodega+ Inc. (contact details in Section 7). As mentioned, we rely on the legal bases of contract, legitimate interest, consent, and legal obligation to process your data. You have the rights detailed in Section 4.7, and you can contact us or our designated representative in the EU (if we appoint one) to exercise those rights or with any questions. At this time, given our primary user base is U.S., we have not appointed an EU representative or UK representative under GDPR, but we will respond directly to inquiries. You also have the right to lodge a complaint with a supervisory authority in your country if you believe we have violated data protection laws.



8.7 Nevada Residents:

Nevada law (SB 220) allows Nevada residents to opt out of the sale of certain personally identifiable information for monetary consideration to a person for that person to license or sell such information to additional persons. As noted earlier, we do not engage in such sales. If you are a Nevada resident who has questions about our data practices under Nevada law, you can contact us to inquire or express an opt-out preference and we will note it, though currently there are no sales to opt out of.



8.8 Acceptance of Policy:

By using the Bodega+ services or by otherwise providing us with personal information, you agree to the terms and conditions of this Privacy Policy. If you do not agree to this Privacy Policy, please do not use our Platform.

Thank you for taking the time to read our Privacy Policy. We hope this document has clearly explained how we handle your data and your rights regarding that data. Bodega+ is committed to safeguarding your privacy while providing a valuable service that connects you with great food and drink deals. If you have any further questions or need clarification on any point, please reach out to us at privacy@bodega-plus.com.



Happy dining with Bodega+!`;

export default function Signup() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const styles = stylesLight;

  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false
  });

  const [nameLabelAnim] = useState(new Animated.Value(clientData.name ? 1 : 0));
  const [emailLabelAnim] = useState(new Animated.Value(clientData.email ? 1 : 0));
  const [passwordLabelAnim] = useState(new Animated.Value(clientData.password ? 1 : 0));
  const [confirmPasswordLabelAnim] = useState(new Animated.Value(clientData.confirmPassword ? 1 : 0));
  const [phoneLabelAnim] = useState(new Animated.Value(clientData.phone ? 1 : 0));
  const [buttonAnim] = useState(new Animated.Value(1));
  const [formAnim] = useState(new Animated.Value(0));
  const [imageAnim] = useState(new Animated.Value(0));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados para la aceptación de Términos y para mostrar el modal
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Google Sign-In configuration
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '446223706539-i8b0j8tasvjm66luvhvt67gtgjl4h41a.apps.googleusercontent.com',
    expoClientId: '446223706539-u2lnq90ruft4lk7onsp9dmot8dh811eb.apps.googleusercontent.com',
    iosClientId: '446223706539-f18kn0300m6l69q9ccj3j4lj27q51att.apps.googleusercontent.com',
    scopes: ['profile', 'email']
  });

  useEffect(() => {
    Animated.timing(formAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(imageAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication);
    }
  }, [response]);

  const handleGoogleSignIn = async (authentication) => {
    try {
      const userInfoResponse = await Axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      });

      const userInfo = userInfoResponse.data;

      const backendResponse = await Axios.post(`${API_URL}/api/auth/googleSignIn`, {
        userInfo,
      });

      if (backendResponse.data.error === false) {
        const _clientData = backendResponse.data;
        dispatch(setUser(_clientData));
  
        navigation.navigate('Main');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: backendResponse.data.message || 'Error in server response.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || error.message || 'Something went wrong. Please try again later.',
      });
    }
  };

  // Apple Sign-In logic
  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token received.');
      }

      const userInfo = {
        email: credential.email || '', 
        fullName: credential.fullName?.givenName || 'Apple User',
        appleUserId: credential.user,
      };

      const backendResponse = await Axios.post(`${API_URL}/api/auth/appleSignIn`, {
        token: credential.identityToken,
      });

      if (backendResponse.data.error === false) {
        const _clientData = backendResponse.data;
        dispatch(setUser(_clientData)); 
           
        navigation.navigate('Main'); 
      } else {
        Alert.alert(
          'Error',
          backendResponse.data.message || 'Error in server response.',
          [{ text: 'OK' }]
        );
      }
    } catch (e) {
      console.error('Error during Apple Sign-In:', e); 
      if (e.code === 'ERR_CANCELED') {
        console.log('The user canceled the operation.');
      } else {
        Alert.alert(
          'Error',
          `Something went wrong during Apple Sign-In: ${e.message}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleChange = (fieldName, value) => {
    setClientData(prevState => ({
      ...prevState,
      [fieldName]: value,
    }));

    let nameError = false;
    let emailError = false;
    let passwordError = false;
    let confirmPasswordError = false;
    let phoneError = false;

    if (fieldName === 'name') {
      nameError = !value.trim() || value.length > 45;
      Animated.timing(nameLabelAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (fieldName === 'email') {
      emailError = !value.trim() || !/^\S+@\S+\.\S+$/.test(value);
      Animated.timing(emailLabelAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (fieldName === 'password') {
      passwordError = !value.trim() || value.length < 6;
      Animated.timing(passwordLabelAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (fieldName === 'confirmPassword') {
      confirmPasswordError = value !== clientData.password;
      Animated.timing(confirmPasswordLabelAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (fieldName === 'phone') {
      phoneError = !value.trim();
      Animated.timing(phoneLabelAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      phone: phoneError
    });
  };

  const handleSignup = async () => {
    const currentErrors = {
      name: !clientData.name.trim() || clientData.name.length > 45,
      email: !clientData.email.trim() || !/^\S+@\S+\.\S+$/.test(clientData.email),
      password: !clientData.password.trim() || clientData.password.length < 6,
      confirmPassword: clientData.confirmPassword !== clientData.password,
      phone: !clientData.phone.trim(),
    };

    setErrors(currentErrors);

    // Verifica que se hayan aceptado los Términos y Condiciones
    if (!acceptedTerms) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Debes aceptar los Términos y Condiciones para registrarte.',
      });
      return;
    }

    if (Object.values(currentErrors).some(error => error)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please correct the form errors before submitting.',
      });
      return;
    }

    Animated.timing(buttonAnim, {
      toValue: 0.95,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      try {
        const response = await Axios.post(`${API_URL}/api/auth/registerUser`, {
          clientData,
          credentials: true,
        });

        if (response.data.error === false) {
          const _clientData = response.data;
          dispatch(setUser(_clientData));
  
          navigation.navigate('Main');
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: response.data.message || 'Error in server response.',
          });
          Animated.timing(buttonAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      } catch (error) {
        const backendErrors = error.response?.data?.errors || {};
        setErrors({
          name: backendErrors.name || currentErrors.name,
          email: backendErrors.email || currentErrors.email,
          password: backendErrors.password || currentErrors.password,
          confirmPassword: backendErrors.confirmPassword || currentErrors.confirmPassword,
          phone: backendErrors.phone || currentErrors.phone,
        });

        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.message || error.message || 'Something went wrong. Please try again later.',
        });
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Animated.View style={[styles.header, { opacity: imageAnim, transform: [{ translateY: imageAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] }]}>
            <LinearGradient
              colors={['#F2BB26', '#F2BB26']}
              style={styles.headerGradient}
            >
              <Image
                source={{ uri: "https://res.cloudinary.com/doqyrz0sg/image/upload/v1728602580/WhatsApp_Image_2024-08-31_at_14.14.14_jhjq2g.jpg" }}
                style={styles.logo}
                resizeMode="contain"
              />
            </LinearGradient>
          </Animated.View>
          <Animated.View style={[styles.formContainer, { opacity: formAnim, transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
            <Text style={styles.title}>Create Your Account</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} color={'#888'} style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('name', value)}
                style={[styles.input, { borderColor: errors.name ? 'red' : '#ccc' }]}
                value={clientData.name}
                placeholder='Name'
                placeholderTextColor={'#888'}
                onFocus={() => Animated.timing(nameLabelAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
                onBlur={() => !clientData.name && Animated.timing(nameLabelAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>Name is required and should be less than 45 characters.</Text>}
            <View style={styles.inputContainer}>
              <FontAwesome name="envelope" size={20} color={'#888'} style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('email', value)}
                style={[styles.input, { borderColor: errors.email ? 'red' : '#ccc' }]}
                value={clientData.email}
                placeholder='Email'
                placeholderTextColor={'#888'}
                onFocus={() => Animated.timing(emailLabelAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
                onBlur={() => !clientData.email && Animated.timing(emailLabelAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>A valid email is required.</Text>}
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color={'#888'} style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('password', value)}
                style={[styles.input, { borderColor: errors.password ? 'red' : '#ccc' }]}
                secureTextEntry={!showPassword}
                value={clientData.password}
                placeholder='Password'
                placeholderTextColor={'#888'}
                onFocus={() => Animated.timing(passwordLabelAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
                onBlur={() => !clientData.password && Animated.timing(passwordLabelAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
                <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color={'#888'} />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>Password is required and should be at least 6 characters.</Text>}
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color={'#888'} style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('confirmPassword', value)}
                style={[styles.input, { borderColor: errors.confirmPassword ? 'red' : '#ccc' }]}
                secureTextEntry={!showConfirmPassword}
                value={clientData.confirmPassword}
                placeholder='Confirm Password'
                placeholderTextColor={'#888'}
                onFocus={() => Animated.timing(confirmPasswordLabelAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
                onBlur={() => !clientData.confirmPassword && Animated.timing(confirmPasswordLabelAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.showPasswordButton}>
                <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color={'#888'} />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>Passwords do not match.</Text>}
            <View style={styles.inputContainer}>
              <FontAwesome name="phone" size={20} color={'#888'} style={styles.icon} />
              <PhoneInput
                value={clientData.phone}
                onChange={(value) => handleChange('phone', value)}
                containerStyle={[styles.phoneInputContainer, { backgroundColor: '#fff', borderColor: '#ddd' }]}
                textContainerStyle={[styles.phoneInputTextContainer, { backgroundColor: '#fff' }]}
                textInputStyle={styles.phoneInputText}
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>A valid phone number is required.</Text>}

            <View style={termsStyles.termsContainer}>
              <TouchableOpacity onPress={() => setAcceptedTerms(!acceptedTerms)}>
                <View style={[termsStyles.checkbox, acceptedTerms && termsStyles.checkedCheckbox]}>
                  {acceptedTerms && <Text style={termsStyles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                <Text style={termsStyles.termsText}>I accept the Terms and Conditions.</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleSignup} style={styles.signInButton}>
              <Animated.Text style={[styles.signInButtonText, { transform: [{ scale: buttonAnim }] }]}>Sign Up</Animated.Text>
            </TouchableOpacity>

            {/* Sección para aceptar los Términos y Condiciones */}
           

            {/* Conditional Sign-In Button */}
            {Platform.OS === 'android' && (
              <TouchableOpacity
                onPress={() => {
                  promptAsync();
                }}
                style={styles.googleButton}
              >
                <FontAwesome name="google" size={20} color="#FFF" style={styles.icon} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            )}
            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                // Set the corner radius to match the sign-up button's borderRadius (25)
                cornerRadius={25}
                // Use the signInButton style to match size and shape
                style={styles.signInButton}
                onPress={handleAppleSignIn}
              />
            )}

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signUpLink}>Log in here</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Modal para mostrar los Términos y Condiciones */}
          <Modal visible={showTermsModal} animationType="slide">
            <SafeAreaView style={termsStyles.modalContainer}>
              <ScrollView contentContainerStyle={termsStyles.modalScroll}>
                <Text style={termsStyles.modalTitle}>Bodega+ Terms of Service</Text>
                <Text style={termsStyles.modalContent}>{TERMS_TEXT}</Text>
              </ScrollView>
              <TouchableOpacity onPress={() => setShowTermsModal(false)} style={termsStyles.modalCloseButton}>
                <Text style={termsStyles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </Modal>
        </View>
        <Toast />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const commonStyles = {
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    height: 100,
    width: '100%',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 520,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  signUpText: {
    color: '#666',
    fontSize: 16,
  },
  signUpLink: {
    color: '#F2BA25',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  showPasswordButton: {
    padding: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
  },
  phoneInputContainer: {
    flex: 1,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#888',
  },
  phoneInputTextContainer: {
    backgroundColor: 'white',
    paddingVertical: 0,
  },
  phoneInputText: {
    color: '#333',
    fontSize: 16,
    height: 50,
    paddingVertical: 10,
  },
  signInButton: {
    backgroundColor: '#F2BA25',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  signInButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DB4437',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    marginBottom: 20,
  },
  googleButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  footerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  forgotText: {
    color: '#F2BA25',
    fontWeight: 'bold',
  }
};

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: "#fff",
  },
});

// Estilos adicionales para los Términos y Condiciones
const termsStyles = StyleSheet.create({
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
   marginBottom:20

  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#888',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#F2BA25',
  },
  checkmark: {
    color: '#000',
    fontSize: 16,
  },
  termsText: {
    color: '#F2BA25',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalCloseButton: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F2BA25',
    borderRadius: 10,
  },
  modalCloseButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
