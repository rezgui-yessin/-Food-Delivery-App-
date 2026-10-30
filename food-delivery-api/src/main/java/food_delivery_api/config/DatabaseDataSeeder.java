package food_delivery_api.config;

import food_delivery_api.modell.*;
import food_delivery_api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final DriverRatingRepository driverRatingRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PlatformSettingsRepository platformSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            log.info("Checking database state for food-delivery platform...");
            
            // 1. Always ensure Admin user and Platform Settings exist
            ensurePlatformSettings();
            User admin = ensureAdminUser();

            // 2. Check if rich demo data already exists
            if (restaurantRepository.count() > 0 && orderRepository.count() > 0) {
                log.info("Database is already populated with restaurants and orders. Skipping full seed.");
                return;
            }

            log.info("Populating database with realistic enterprise data...");

            // 3. Create Demo Users (Restaurant Owners, Drivers, Customers)
            String commonPassword = passwordEncoder.encode("Password123!");

            User ownerMario = userRepository.findByEmail("mario@gustoitalia.com").orElseGet(() ->
                    userRepository.save(User.builder()
                            .email("mario@gustoitalia.com")
                            .fullName("Chef Mario Rossi")
                            .passwordHash(commonPassword)
                            .phone("+1 212-555-0101")
                            .role(Role.RESTAURANT_OWNER)
                            .active(true)
                            .approved(true)
                            .createdAt(Instant.now().minus(90, ChronoUnit.DAYS))
                            .build()));

            User ownerSakura = userRepository.findByEmail("sakura@tokyobites.com").orElseGet(() ->
                    userRepository.save(User.builder()
                            .email("sakura@tokyobites.com")
                            .fullName("Sakura Tanaka")
                            .passwordHash(commonPassword)
                            .phone("+1 212-555-0102")
                            .role(Role.RESTAURANT_OWNER)
                            .active(true)
                            .approved(true)
                            .createdAt(Instant.now().minus(80, ChronoUnit.DAYS))
                            .build()));

            User ownerCarlos = userRepository.findByEmail("carlos@tacofiesta.com").orElseGet(() ->
                    userRepository.save(User.builder()
                            .email("carlos@tacofiesta.com")
                            .fullName("Carlos Rodriguez")
                            .passwordHash(commonPassword)
                            .phone("+1 718-555-0103")
                            .role(Role.RESTAURANT_OWNER)
                            .active(true)
                            .approved(true)
                            .createdAt(Instant.now().minus(75, ChronoUnit.DAYS))
                            .build()));

            User driverAlex = userRepository.findByEmail("alex.driver@fooddelivery.com").orElseGet(() ->
                    userRepository.save(User.builder()
                            .email("alex.driver@fooddelivery.com")
                            .fullName("Alex Rider")
                            .passwordHash(commonPassword)
                            .phone("+1 212-555-0201")
                            .role(Role.DELIVERY_DRIVER)
                            .active(true)
                            .approved(true)
                            .vehicleType("Scooter / Vespa Sprint 150")
                            .vehiclePlate("NY-SPD-88")
                            .deliveryZone("Manhattan Downtown & Midtown")
                            .driverAvailable(true)
                            .driverRating(4.9)
                            .currentLatitude(40.7128)
                            .currentLongitude(-74.0060)
                            .createdAt(Instant.now().minus(60, ChronoUnit.DAYS))
                            .build()));

            User driverSarah = userRepository.findByEmail("sarah.courier@fooddelivery.com").orElseGet(() ->
                    userRepository.save(User.builder()
                            .email("sarah.courier@fooddelivery.com")
                            .fullName("Sarah Jenkins")
                            .passwordHash(commonPassword)
                            .phone("+1 212-555-0202")
                            .role(Role.DELIVERY_DRIVER)
                            .active(true)
                            .approved(true)
                            .vehicleType("E-Bike (RadCity 5)")
                            .vehiclePlate("BK-EBIKE-14")
                            .deliveryZone("Brooklyn & Lower East Side")
                            .driverAvailable(true)
                            .driverRating(4.8)
                            .currentLatitude(40.7282)
                            .currentLongitude(-73.9942)
                            .createdAt(Instant.now().minus(50, ChronoUnit.DAYS))
                            .build()));

            User driverDavid = userRepository.findByEmail("david.rider@fooddelivery.com").orElseGet(() ->
                    userRepository.save(User.builder()
                            .email("david.rider@fooddelivery.com")
                            .fullName("David Miller")
                            .passwordHash(commonPassword)
                            .phone("+1 212-555-0203")
                            .role(Role.DELIVERY_DRIVER)
                            .active(true)
                            .approved(true)
                            .vehicleType("Toyota Prius Hybrid")
                            .vehiclePlate("NY-CAR-4491")
                            .deliveryZone("Midtown & Uptown")
                            .driverAvailable(false)
                            .driverRating(4.7)
                            .currentLatitude(40.7580)
                            .currentLongitude(-73.9855)
                            .createdAt(Instant.now().minus(40, ChronoUnit.DAYS))
                            .build()));

            // Customers with addresses
            Address emmaHome = Address.builder()
                    .id(UUID.randomUUID().toString())
                    .label("Home (Penthouse)")
                    .street("180 Riverside Blvd, Apt 14B")
                    .city("New York")
                    .postalCode("10069")
                    .isDefault(true)
                    .build();

            Address emmaOffice = Address.builder()
                    .id(UUID.randomUUID().toString())
                    .label("Work (Design Studio)")
                    .street("350 5th Avenue, Suite 4100")
                    .city("New York")
                    .postalCode("10118")
                    .isDefault(false)
                    .build();

            User customerEmma = userRepository.findByEmail("emma.watson@gmail.com").orElseGet(() ->
                    userRepository.save(User.builder()
                            .email("emma.watson@gmail.com")
                            .fullName("Emma Watson")
                            .passwordHash(commonPassword)
                            .phone("+1 212-555-0301")
                            .role(Role.CUSTOMER)
                            .active(true)
                            .approved(true)
                            .addresses(new ArrayList<>(List.of(emmaHome, emmaOffice)))
                            .createdAt(Instant.now().minus(65, ChronoUnit.DAYS))
                            .build()));

            Address johnHome = Address.builder()
                    .id(UUID.randomUUID().toString())
                    .label("Home")
                    .street("75 Varick Street, Apt 5C")
                    .city("New York")
                    .postalCode("10013")
                    .isDefault(true)
                    .build();

            User customerJohn = userRepository.findByEmail("john.doe@gmail.com").orElseGet(() ->
                    userRepository.save(User.builder()
                            .email("john.doe@gmail.com")
                            .fullName("John Doe")
                            .passwordHash(commonPassword)
                            .phone("+1 212-555-0302")
                            .role(Role.CUSTOMER)
                            .active(true)
                            .approved(true)
                            .addresses(new ArrayList<>(List.of(johnHome)))
                            .createdAt(Instant.now().minus(55, ChronoUnit.DAYS))
                            .build()));

            Address sophiaHome = Address.builder()
                    .id(UUID.randomUUID().toString())
                    .label("Home")
                    .street("450 Lexington Ave, Fl 18")
                    .city("New York")
                    .postalCode("10017")
                    .isDefault(true)
                    .build();

            User customerSophia = userRepository.findByEmail("sophia.chen@gmail.com").orElseGet(() ->
                    userRepository.save(User.builder()
                            .email("sophia.chen@gmail.com")
                            .fullName("Sophia Chen")
                            .passwordHash(commonPassword)
                            .phone("+1 212-555-0303")
                            .role(Role.CUSTOMER)
                            .active(true)
                            .approved(true)
                            .addresses(new ArrayList<>(List.of(sophiaHome)))
                            .createdAt(Instant.now().minus(45, ChronoUnit.DAYS))
                            .build()));

            // 4. Create Restaurants with Opening Hours
            Map<String, String> standardHours = Map.of(
                    "monday", "11:00 AM - 10:00 PM",
                    "tuesday", "11:00 AM - 10:00 PM",
                    "wednesday", "11:00 AM - 10:00 PM",
                    "thursday", "11:00 AM - 10:30 PM",
                    "friday", "11:00 AM - 11:30 PM",
                    "saturday", "12:00 PM - 11:30 PM",
                    "sunday", "12:00 PM - 9:30 PM"
            );

            Restaurant r1 = restaurantRepository.save(Restaurant.builder()
                    .ownerId(ownerMario.getId())
                    .name("Trattoria Da Mario")
                    .description("Authentic wood-fired Neapolitan pizzas, artisanal handcrafted pasta, and classic Italian desserts made fresh daily.")
                    .address("142 Mulberry St, Little Italy, New York, NY 10013")
                    .phone("+1 212-555-0144")
                    .cuisineType("Italian")
                    .open(true)
                    .approved(true)
                    .rating(4.9)
                    .deliveryTimeMin(25)
                    .deliveryFee(BigDecimal.valueOf(2.99))
                    .taxRate(BigDecimal.valueOf(8.875))
                    .commissionRate(BigDecimal.valueOf(15))
                    .imageUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80")
                    .openingHours(standardHours)
                    .build());

            Restaurant r2 = restaurantRepository.save(Restaurant.builder()
                    .ownerId(ownerSakura.getId())
                    .name("Tokyo Zen Sushi & Ramen")
                    .description("Premium sashimi grade fish, slow-simmered 24hr tonkotsu ramen broth, and handcrafted specialty maki rolls.")
                    .address("88 East 10th St, East Village, New York, NY 10003")
                    .phone("+1 212-555-0178")
                    .cuisineType("Japanese")
                    .open(true)
                    .approved(true)
                    .rating(4.8)
                    .deliveryTimeMin(20)
                    .deliveryFee(BigDecimal.valueOf(3.49))
                    .taxRate(BigDecimal.valueOf(8.875))
                    .commissionRate(BigDecimal.valueOf(15))
                    .imageUrl("https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80")
                    .openingHours(standardHours)
                    .build());

            Restaurant r3 = restaurantRepository.save(Restaurant.builder()
                    .ownerId(ownerCarlos.getId())
                    .name("Taquería Los Amigos")
                    .description("Slow-braised birria tacos with savory consomé, freshly pressed corn tortillas, and homemade fire-roasted salsas.")
                    .address("310 St Marks Pl, Brooklyn, NY 11217")
                    .phone("+1 718-555-0192")
                    .cuisineType("Mexican")
                    .open(true)
                    .approved(true)
                    .rating(4.7)
                    .deliveryTimeMin(30)
                    .deliveryFee(BigDecimal.valueOf(1.99))
                    .taxRate(BigDecimal.valueOf(8.875))
                    .commissionRate(BigDecimal.valueOf(15))
                    .imageUrl("https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80")
                    .openingHours(standardHours)
                    .build());

            Restaurant r4 = restaurantRepository.save(Restaurant.builder()
                    .ownerId(ownerMario.getId())
                    .name("Craft Burger & Brews")
                    .description("Gourmet dry-aged smash burgers, truffle parmesan hand-cut fries, and craft milkshakes made with organic ice cream.")
                    .address("520 Hudson St, West Village, New York, NY 10014")
                    .phone("+1 212-555-0163")
                    .cuisineType("American")
                    .open(true)
                    .approved(true)
                    .rating(4.6)
                    .deliveryTimeMin(25)
                    .deliveryFee(BigDecimal.valueOf(2.49))
                    .taxRate(BigDecimal.valueOf(8.875))
                    .commissionRate(BigDecimal.valueOf(15))
                    .imageUrl("https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80")
                    .openingHours(standardHours)
                    .build());

            // Add favorites for Emma
            customerEmma.setFavoriteRestaurantIds(new ArrayList<>(List.of(r1.getId(), r2.getId())));
            userRepository.save(customerEmma);

            // 5. Create Categories for Restaurants
            Category catPizza = categoryRepository.save(Category.builder().restaurantId(r1.getId()).name("Wood-Fired Pizza").description("Crispy thin crust baked at 900 degrees").sortOrder(1).active(true).build());
            Category catPasta = categoryRepository.save(Category.builder().restaurantId(r1.getId()).name("Handmade Pasta").description("Crafted daily with organic semolina").sortOrder(2).active(true).build());
            Category catDolci = categoryRepository.save(Category.builder().restaurantId(r1.getId()).name("Dolci & Desserts").description("Authentic Italian sweets").sortOrder(3).active(true).build());

            Category catRamen = categoryRepository.save(Category.builder().restaurantId(r2.getId()).name("Artisanal Ramen").description("Rich, deeply flavored broths with handmade noodles").sortOrder(1).active(true).build());
            Category catSushi = categoryRepository.save(Category.builder().restaurantId(r2.getId()).name("Sushi & Specialty Rolls").description("Freshly cut premium maki and nigiri").sortOrder(2).active(true).build());
            Category catAppetizers = categoryRepository.save(Category.builder().restaurantId(r2.getId()).name("Izakaya Appetizers").description("Crispy dumplings and small bites").sortOrder(3).active(true).build());

            Category catTacos = categoryRepository.save(Category.builder().restaurantId(r3.getId()).name("Street Tacos").description("Served on double handmade corn tortillas").sortOrder(1).active(true).build());
            Category catBurritos = categoryRepository.save(Category.builder().restaurantId(r3.getId()).name("Signature Burritos").description("Stuffed with rice, beans, guacamole & salsa").sortOrder(2).active(true).build());
            Category catSides = categoryRepository.save(Category.builder().restaurantId(r3.getId()).name("Antojitos & Sides").description("Guacamole, elote, and tortilla chips").sortOrder(3).active(true).build());

            Category catBurgers = categoryRepository.save(Category.builder().restaurantId(r4.getId()).name("Smash Burgers").description("Custom blend chuck, brisket & short rib").sortOrder(1).active(true).build());
            Category catFries = categoryRepository.save(Category.builder().restaurantId(r4.getId()).name("Loaded Sides").description("Hand-cut twice-cooked Idaho potato fries").sortOrder(2).active(true).build());

            // 6. Create Menu Items
            // Trattoria Da Mario Items
            MenuItem itemMargherita = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r1.getId())
                    .name("Pizza Margherita D.O.P.")
                    .description("San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil, and extra virgin olive oil.")
                    .price(BigDecimal.valueOf(18.50))
                    .category(catPizza.getName())
                    .available(true)
                    .stockQuantity(50)
                    .preparationTimeMinutes(15)
                    .sortOrder(1)
                    .imageUrl("https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80")
                    .build());

            MenuItem itemDiavola = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r1.getId())
                    .name("Pizza Diavola Piccante")
                    .description("Spicy Calabrian salami, fior di latte mozzarella, hot chili honey drizzle, and fresh oregano.")
                    .price(BigDecimal.valueOf(21.00))
                    .category(catPizza.getName())
                    .available(true)
                    .stockQuantity(40)
                    .preparationTimeMinutes(15)
                    .sortOrder(2)
                    .imageUrl("https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80")
                    .build());

            MenuItem itemTagliatelle = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r1.getId())
                    .name("Truffle Wild Mushroom Tagliatelle")
                    .description("Ribbon egg pasta tossed in black summer truffle butter, porcini mushrooms, and 24-month Parmigiano-Reggiano.")
                    .price(BigDecimal.valueOf(24.50))
                    .category(catPasta.getName())
                    .available(true)
                    .stockQuantity(35)
                    .preparationTimeMinutes(20)
                    .sortOrder(3)
                    .imageUrl("https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=600&auto=format&fit=crop&q=80")
                    .build());

            MenuItem itemTiramisu = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r1.getId())
                    .name("Classic Venetian Tiramisu")
                    .description("Savoiardi ladyfingers soaked in dark roast espresso and Amaretto, layered with rich mascarpone zabaglione.")
                    .price(BigDecimal.valueOf(9.50))
                    .category(catDolci.getName())
                    .available(true)
                    .stockQuantity(30)
                    .preparationTimeMinutes(5)
                    .sortOrder(4)
                    .imageUrl("https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80")
                    .build());

            // Tokyo Zen Items
            MenuItem itemTonkotsu = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r2.getId())
                    .name("Black Garlic Tonkotsu Ramen")
                    .description("24-hour pork bone broth, tender chashu pork belly, ajitsuke tamago egg, bamboo shoots, and roasted black garlic oil.")
                    .price(BigDecimal.valueOf(19.50))
                    .category(catRamen.getName())
                    .available(true)
                    .stockQuantity(60)
                    .preparationTimeMinutes(15)
                    .sortOrder(1)
                    .imageUrl("https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80")
                    .build());

            MenuItem itemSpicySalmon = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r2.getId())
                    .name("Spicy Salmon Avocado Roll")
                    .description("Wild Alaskan king salmon, spicy sriracha mayo, Hass avocado, cucumber, topped with crunchy tempura flakes.")
                    .price(BigDecimal.valueOf(14.00))
                    .category(catSushi.getName())
                    .available(true)
                    .stockQuantity(45)
                    .preparationTimeMinutes(12)
                    .sortOrder(2)
                    .imageUrl("https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&auto=format&fit=crop&q=80")
                    .build());

            MenuItem itemDragonRoll = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r2.getId())
                    .name("Imperial Dragon Roll")
                    .description("Crispy shrimp tempura, BBQ eel, thinly sliced avocado scales, toasted sesame seeds, and sweet kabayaki glaze.")
                    .price(BigDecimal.valueOf(18.00))
                    .category(catSushi.getName())
                    .available(true)
                    .stockQuantity(30)
                    .preparationTimeMinutes(15)
                    .sortOrder(3)
                    .imageUrl("https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&auto=format&fit=crop&q=80")
                    .build());

            MenuItem itemGyoza = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r2.getId())
                    .name("Pan-Seared Kurobuta Gyoza")
                    .description("Six Japanese dumplings filled with Berkshire minced pork, cabbage, and ginger, served with spicy sesame scallion dip.")
                    .price(BigDecimal.valueOf(10.50))
                    .category(catAppetizers.getName())
                    .available(true)
                    .stockQuantity(50)
                    .preparationTimeMinutes(10)
                    .sortOrder(4)
                    .imageUrl("https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80")
                    .build());

            // Taquería Los Amigos Items
            MenuItem itemBirria = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r3.getId())
                    .name("Quesabirria Tacos with Consomé")
                    .description("Three crispy corn tortillas dipped in chili oil, melted Oaxaca cheese, tender shredded beef chuck, cilantro & onions.")
                    .price(BigDecimal.valueOf(16.50))
                    .category(catTacos.getName())
                    .available(true)
                    .stockQuantity(70)
                    .preparationTimeMinutes(14)
                    .sortOrder(1)
                    .imageUrl("https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&auto=format&fit=crop&q=80")
                    .build());

            MenuItem itemAlPastor = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r3.getId())
                    .name("Tacos al Pastor")
                    .description("Three spit-roasted marinated pork tacos with charred pineapple, diced red onion, salsa verde, and fresh cilantro.")
                    .price(BigDecimal.valueOf(14.50))
                    .category(catTacos.getName())
                    .available(true)
                    .stockQuantity(65)
                    .preparationTimeMinutes(12)
                    .sortOrder(2)
                    .imageUrl("https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=600&auto=format&fit=crop&q=80")
                    .build());

            MenuItem itemGuac = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r3.getId())
                    .name("Guacamole & Totopos Frescos")
                    .description("Freshly mashed Michoacán avocados with lime, serrano peppers, tomatoes, and sea-salted warm tortilla chips.")
                    .price(BigDecimal.valueOf(9.00))
                    .category(catSides.getName())
                    .available(true)
                    .stockQuantity(80)
                    .preparationTimeMinutes(8)
                    .sortOrder(3)
                    .imageUrl("https://images.unsplash.com/photo-1541288097308-7b8e3f58c4c6?w=600&auto=format&fit=crop&q=80")
                    .build());

            // Craft Burger Items
            MenuItem itemSmokeBurger = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r4.getId())
                    .name("The Smokehouse Prime Smash")
                    .description("Double 4oz dry-aged beef patties, smoked applewood bacon, Vermont sharp cheddar, crispy fried shallots, BBQ sauce.")
                    .price(BigDecimal.valueOf(17.50))
                    .category(catBurgers.getName())
                    .available(true)
                    .stockQuantity(55)
                    .preparationTimeMinutes(15)
                    .sortOrder(1)
                    .imageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80")
                    .build());

            MenuItem itemTruffleFries = menuItemRepository.save(MenuItem.builder()
                    .restaurantId(r4.getId())
                    .name("Truffle Herb Parmesan Fries")
                    .description("Crisp russet potato fries tossed in white truffle oil, grated parmesan, fresh parsley, and roasted garlic aioli.")
                    .price(BigDecimal.valueOf(8.50))
                    .category(catFries.getName())
                    .available(true)
                    .stockQuantity(60)
                    .preparationTimeMinutes(10)
                    .sortOrder(2)
                    .imageUrl("https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80")
                    .build());

            // 7. Create Coupons
            couponRepository.save(Coupon.builder()
                    .code("WELCOME20")
                    .description("20% off for all platform newcomers")
                    .discountType(DiscountType.PERCENTAGE)
                    .discountValue(BigDecimal.valueOf(20))
                    .minOrderAmount(BigDecimal.valueOf(20))
                    .maxDiscountAmount(BigDecimal.valueOf(15))
                    .startDate(Instant.now().minus(30, ChronoUnit.DAYS))
                    .expiryDate(Instant.now().plus(180, ChronoUnit.DAYS))
                    .maxUsageCount(500)
                    .usageCount(34)
                    .active(true)
                    .build());

            couponRepository.save(Coupon.builder()
                    .code("SAVE10")
                    .description("$10 flat discount on orders over $35")
                    .discountType(DiscountType.FIXED_AMOUNT)
                    .discountValue(BigDecimal.valueOf(10))
                    .minOrderAmount(BigDecimal.valueOf(35))
                    .startDate(Instant.now().minus(20, ChronoUnit.DAYS))
                    .expiryDate(Instant.now().plus(90, ChronoUnit.DAYS))
                    .maxUsageCount(200)
                    .usageCount(48)
                    .active(true)
                    .build());

            couponRepository.save(Coupon.builder()
                    .code("FREEDELIVERY")
                    .description("Free delivery credit on orders over $25")
                    .discountType(DiscountType.FIXED_AMOUNT)
                    .discountValue(BigDecimal.valueOf(3.50))
                    .minOrderAmount(BigDecimal.valueOf(25))
                    .startDate(Instant.now().minus(10, ChronoUnit.DAYS))
                    .expiryDate(Instant.now().plus(60, ChronoUnit.DAYS))
                    .maxUsageCount(300)
                    .usageCount(19)
                    .active(true)
                    .build());

            couponRepository.save(Coupon.builder()
                    .code("MARIO15")
                    .description("15% off at Trattoria Da Mario")
                    .restaurantId(r1.getId())
                    .discountType(DiscountType.PERCENTAGE)
                    .discountValue(BigDecimal.valueOf(15))
                    .minOrderAmount(BigDecimal.valueOf(30))
                    .startDate(Instant.now().minus(15, ChronoUnit.DAYS))
                    .expiryDate(Instant.now().plus(60, ChronoUnit.DAYS))
                    .maxUsageCount(100)
                    .usageCount(12)
                    .active(true)
                    .build());

            // 8. Create Realistic Orders Across All Lifecycle States
            Instant now = Instant.now();

            // Order 1: DELIVERED (Emma Watson from Trattoria Da Mario)
            List<OrderItem> itemsOrder1 = List.of(
                    OrderItem.builder().menuItemId(itemMargherita.getId()).name(itemMargherita.getName()).unitPrice(itemMargherita.getPrice()).quantity(1).subtotal(BigDecimal.valueOf(18.50)).build(),
                    OrderItem.builder().menuItemId(itemTagliatelle.getId()).name(itemTagliatelle.getName()).unitPrice(itemTagliatelle.getPrice()).quantity(1).subtotal(BigDecimal.valueOf(24.50)).build(),
                    OrderItem.builder().menuItemId(itemTiramisu.getId()).name(itemTiramisu.getName()).unitPrice(itemTiramisu.getPrice()).quantity(1).subtotal(BigDecimal.valueOf(9.50)).build()
            );
            BigDecimal subtotal1 = BigDecimal.valueOf(52.50);
            BigDecimal tax1 = BigDecimal.valueOf(4.66);
            BigDecimal deliveryFee1 = BigDecimal.valueOf(2.99);
            BigDecimal total1 = subtotal1.add(tax1).add(deliveryFee1);

            Order order1 = orderRepository.save(Order.builder()
                    .restaurantId(r1.getId())
                    .customerId(customerEmma.getId())
                    .customerName(customerEmma.getFullName())
                    .customerPhone(customerEmma.getPhone())
                    .deliveryAddress(emmaHome.getStreet() + ", " + emmaHome.getCity() + " " + emmaHome.getPostalCode())
                    .items(itemsOrder1)
                    .subtotalAmount(subtotal1)
                    .taxAmount(tax1)
                    .deliveryFee(deliveryFee1)
                    .commissionAmount(subtotal1.multiply(BigDecimal.valueOf(0.15)))
                    .totalAmount(total1)
                    .paymentMethod(PaymentMethod.CARD)
                    .paymentStatus(PaymentStatus.PAID)
                    .stripePaymentIntentId("pi_simulated_delivered_1001")
                    .driverId(driverAlex.getId())
                    .driverName(driverAlex.getFullName())
                    .driverPhone(driverAlex.getPhone())
                    .status(OrderStatus.DELIVERED)
                    .deliveryProofSignature("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><path d='M10 50 Q 50 10 90 50' stroke='black' fill='none'/></svg>")
                    .deliveryProofCode("8821")
                    .deliveryProofAt(now.minus(2, ChronoUnit.HOURS))
                    .createdAt(now.minus(3, ChronoUnit.HOURS))
                    .updatedAt(now.minus(2, ChronoUnit.HOURS))
                    .build());

            // Order 1 Review & Driver Rating
            reviewRepository.save(Review.builder()
                    .restaurantId(r1.getId())
                    .customerId(customerEmma.getId())
                    .customerName(customerEmma.getFullName())
                    .rating(5)
                    .comment("Incredible wood-fired crust and the truffle tagliatelle was rich and sublime. Arrived in under 30 minutes!")
                    .createdAt(now.minus(2, ChronoUnit.HOURS))
                    .build());

            driverRatingRepository.save(DriverRating.builder()
                    .driverId(driverAlex.getId())
                    .customerId(customerEmma.getId())
                    .orderId(order1.getId())
                    .rating(5)
                    .comment("Polite driver, handled the pizza carefully so no cheese slipped!")
                    .createdAt(now.minus(2, ChronoUnit.HOURS))
                    .build());

            // Order 2: DELIVERED (John Doe from Tokyo Zen)
            List<OrderItem> itemsOrder2 = List.of(
                    OrderItem.builder().menuItemId(itemTonkotsu.getId()).name(itemTonkotsu.getName()).unitPrice(itemTonkotsu.getPrice()).quantity(2).subtotal(BigDecimal.valueOf(39.00)).build(),
                    OrderItem.builder().menuItemId(itemGyoza.getId()).name(itemGyoza.getName()).unitPrice(itemGyoza.getPrice()).quantity(1).subtotal(BigDecimal.valueOf(10.50)).build()
            );
            BigDecimal subtotal2 = BigDecimal.valueOf(49.50);
            BigDecimal tax2 = BigDecimal.valueOf(4.39);
            BigDecimal deliveryFee2 = BigDecimal.valueOf(3.49);
            BigDecimal total2 = subtotal2.add(tax2).add(deliveryFee2);

            Order order2 = orderRepository.save(Order.builder()
                    .restaurantId(r2.getId())
                    .customerId(customerJohn.getId())
                    .customerName(customerJohn.getFullName())
                    .customerPhone(customerJohn.getPhone())
                    .deliveryAddress(johnHome.getStreet() + ", " + johnHome.getCity() + " " + johnHome.getPostalCode())
                    .items(itemsOrder2)
                    .subtotalAmount(subtotal2)
                    .taxAmount(tax2)
                    .deliveryFee(deliveryFee2)
                    .commissionAmount(subtotal2.multiply(BigDecimal.valueOf(0.15)))
                    .totalAmount(total2)
                    .paymentMethod(PaymentMethod.CARD)
                    .paymentStatus(PaymentStatus.PAID)
                    .stripePaymentIntentId("pi_simulated_delivered_1002")
                    .driverId(driverSarah.getId())
                    .driverName(driverSarah.getFullName())
                    .driverPhone(driverSarah.getPhone())
                    .status(OrderStatus.DELIVERED)
                    .deliveryProofSignature("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><path d='M20 40 L60 80 L120 20' stroke='green' fill='none'/></svg>")
                    .deliveryProofCode("4190")
                    .deliveryProofAt(now.minus(4, ChronoUnit.HOURS))
                    .createdAt(now.minus(5, ChronoUnit.HOURS))
                    .updatedAt(now.minus(4, ChronoUnit.HOURS))
                    .build());

            reviewRepository.save(Review.builder()
                    .restaurantId(r2.getId())
                    .customerId(customerJohn.getId())
                    .customerName(customerJohn.getFullName())
                    .rating(5)
                    .comment("The tonkotsu broth is so authentic and rich! The gyoza were crispy on the bottom.")
                    .createdAt(now.minus(4, ChronoUnit.HOURS))
                    .build());

            driverRatingRepository.save(DriverRating.builder()
                    .driverId(driverSarah.getId())
                    .customerId(customerJohn.getId())
                    .orderId(order2.getId())
                    .rating(5)
                    .comment("Super speedy on her e-bike, food arrived steaming hot!")
                    .createdAt(now.minus(4, ChronoUnit.HOURS))
                    .build());

            // Order 3: OUT_FOR_DELIVERY (Sophia Chen from Taquería Los Amigos, Driver Alex)
            List<OrderItem> itemsOrder3 = List.of(
                    OrderItem.builder().menuItemId(itemBirria.getId()).name(itemBirria.getName()).unitPrice(itemBirria.getPrice()).quantity(2).subtotal(BigDecimal.valueOf(33.00)).build(),
                    OrderItem.builder().menuItemId(itemGuac.getId()).name(itemGuac.getName()).unitPrice(itemGuac.getPrice()).quantity(1).subtotal(BigDecimal.valueOf(9.00)).build()
            );
            BigDecimal subtotal3 = BigDecimal.valueOf(42.00);
            BigDecimal tax3 = BigDecimal.valueOf(3.73);
            BigDecimal deliveryFee3 = BigDecimal.valueOf(1.99);
            BigDecimal total3 = subtotal3.add(tax3).add(deliveryFee3);

            Order order3 = orderRepository.save(Order.builder()
                    .restaurantId(r3.getId())
                    .customerId(customerSophia.getId())
                    .customerName(customerSophia.getFullName())
                    .customerPhone(customerSophia.getPhone())
                    .deliveryAddress(sophiaHome.getStreet() + ", " + sophiaHome.getCity() + " " + sophiaHome.getPostalCode())
                    .items(itemsOrder3)
                    .subtotalAmount(subtotal3)
                    .taxAmount(tax3)
                    .deliveryFee(deliveryFee3)
                    .commissionAmount(subtotal3.multiply(BigDecimal.valueOf(0.15)))
                    .totalAmount(total3)
                    .paymentMethod(PaymentMethod.CARD)
                    .paymentStatus(PaymentStatus.PAID)
                    .stripePaymentIntentId("pi_simulated_out_1003")
                    .driverId(driverAlex.getId())
                    .driverName(driverAlex.getFullName())
                    .driverPhone(driverAlex.getPhone())
                    .status(OrderStatus.OUT_FOR_DELIVERY)
                    .estimatedDeliveryMinutes(12)
                    .createdAt(now.minus(25, ChronoUnit.MINUTES))
                    .updatedAt(now.minus(5, ChronoUnit.MINUTES))
                    .build());

            // Order 4: READY_FOR_PICKUP (Emma Watson from Tokyo Zen, Waiting for driver)
            List<OrderItem> itemsOrder4 = List.of(
                    OrderItem.builder().menuItemId(itemDragonRoll.getId()).name(itemDragonRoll.getName()).unitPrice(itemDragonRoll.getPrice()).quantity(1).subtotal(BigDecimal.valueOf(18.00)).build(),
                    OrderItem.builder().menuItemId(itemSpicySalmon.getId()).name(itemSpicySalmon.getName()).unitPrice(itemSpicySalmon.getPrice()).quantity(1).subtotal(BigDecimal.valueOf(14.00)).build()
            );
            BigDecimal subtotal4 = BigDecimal.valueOf(32.00);
            BigDecimal tax4 = BigDecimal.valueOf(2.84);
            BigDecimal deliveryFee4 = BigDecimal.valueOf(3.49);
            BigDecimal total4 = subtotal4.add(tax4).add(deliveryFee4);

            Order order4 = orderRepository.save(Order.builder()
                    .restaurantId(r2.getId())
                    .customerId(customerEmma.getId())
                    .customerName(customerEmma.getFullName())
                    .customerPhone(customerEmma.getPhone())
                    .deliveryAddress(emmaHome.getStreet() + ", " + emmaHome.getCity() + " " + emmaHome.getPostalCode())
                    .items(itemsOrder4)
                    .subtotalAmount(subtotal4)
                    .taxAmount(tax4)
                    .deliveryFee(deliveryFee4)
                    .commissionAmount(subtotal4.multiply(BigDecimal.valueOf(0.15)))
                    .totalAmount(total4)
                    .paymentMethod(PaymentMethod.CARD)
                    .paymentStatus(PaymentStatus.PAID)
                    .status(OrderStatus.READY_FOR_PICKUP)
                    .createdAt(now.minus(20, ChronoUnit.MINUTES))
                    .updatedAt(now.minus(2, ChronoUnit.MINUTES))
                    .build());

            // Order 5: PREPARING (John Doe from Craft Burger & Brews)
            List<OrderItem> itemsOrder5 = List.of(
                    OrderItem.builder().menuItemId(itemSmokeBurger.getId()).name(itemSmokeBurger.getName()).unitPrice(itemSmokeBurger.getPrice()).quantity(2).subtotal(BigDecimal.valueOf(35.00)).specialInstructions("Medium rare please").build(),
                    OrderItem.builder().menuItemId(itemTruffleFries.getId()).name(itemTruffleFries.getName()).unitPrice(itemTruffleFries.getPrice()).quantity(2).subtotal(BigDecimal.valueOf(17.00)).specialInstructions("Extra aioli on the side").build()
            );
            BigDecimal subtotal5 = BigDecimal.valueOf(52.00);
            BigDecimal tax5 = BigDecimal.valueOf(4.62);
            BigDecimal deliveryFee5 = BigDecimal.valueOf(2.49);
            BigDecimal total5 = subtotal5.add(tax5).add(deliveryFee5);

            Order order5 = orderRepository.save(Order.builder()
                    .restaurantId(r4.getId())
                    .customerId(customerJohn.getId())
                    .customerName(customerJohn.getFullName())
                    .customerPhone(customerJohn.getPhone())
                    .deliveryAddress(johnHome.getStreet() + ", " + johnHome.getCity() + " " + johnHome.getPostalCode())
                    .items(itemsOrder5)
                    .subtotalAmount(subtotal5)
                    .taxAmount(tax5)
                    .deliveryFee(deliveryFee5)
                    .commissionAmount(subtotal5.multiply(BigDecimal.valueOf(0.15)))
                    .totalAmount(total5)
                    .paymentMethod(PaymentMethod.CARD)
                    .paymentStatus(PaymentStatus.PAID)
                    .status(OrderStatus.PREPARING)
                    .createdAt(now.minus(14, ChronoUnit.MINUTES))
                    .updatedAt(now.minus(10, ChronoUnit.MINUTES))
                    .build());

            // Order 6: CONFIRMED (Sophia Chen from Trattoria Da Mario)
            List<OrderItem> itemsOrder6 = List.of(
                    OrderItem.builder().menuItemId(itemDiavola.getId()).name(itemDiavola.getName()).unitPrice(itemDiavola.getPrice()).quantity(1).subtotal(BigDecimal.valueOf(21.00)).build(),
                    OrderItem.builder().menuItemId(itemTiramisu.getId()).name(itemTiramisu.getName()).unitPrice(itemTiramisu.getPrice()).quantity(1).subtotal(BigDecimal.valueOf(9.50)).build()
            );
            BigDecimal subtotal6 = BigDecimal.valueOf(30.50);
            BigDecimal tax6 = BigDecimal.valueOf(2.71);
            BigDecimal deliveryFee6 = BigDecimal.valueOf(2.99);
            BigDecimal total6 = subtotal6.add(tax6).add(deliveryFee6);

            Order order6 = orderRepository.save(Order.builder()
                    .restaurantId(r1.getId())
                    .customerId(customerSophia.getId())
                    .customerName(customerSophia.getFullName())
                    .customerPhone(customerSophia.getPhone())
                    .deliveryAddress(sophiaHome.getStreet() + ", " + sophiaHome.getCity() + " " + sophiaHome.getPostalCode())
                    .items(itemsOrder6)
                    .subtotalAmount(subtotal6)
                    .taxAmount(tax6)
                    .deliveryFee(deliveryFee6)
                    .commissionAmount(subtotal6.multiply(BigDecimal.valueOf(0.15)))
                    .totalAmount(total6)
                    .paymentMethod(PaymentMethod.CARD)
                    .paymentStatus(PaymentStatus.PAID)
                    .status(OrderStatus.CONFIRMED)
                    .createdAt(now.minus(8, ChronoUnit.MINUTES))
                    .updatedAt(now.minus(7, ChronoUnit.MINUTES))
                    .build());

            // Order 7: PLACED (New live incoming order for Mario)
            List<OrderItem> itemsOrder7 = List.of(
                    OrderItem.builder().menuItemId(itemMargherita.getId()).name(itemMargherita.getName()).unitPrice(itemMargherita.getPrice()).quantity(2).subtotal(BigDecimal.valueOf(37.00)).build()
            );
            BigDecimal subtotal7 = BigDecimal.valueOf(37.00);
            BigDecimal tax7 = BigDecimal.valueOf(3.28);
            BigDecimal deliveryFee7 = BigDecimal.valueOf(2.99);
            BigDecimal total7 = subtotal7.add(tax7).add(deliveryFee7);

            Order order7 = orderRepository.save(Order.builder()
                    .restaurantId(r1.getId())
                    .customerId(customerEmma.getId())
                    .customerName(customerEmma.getFullName())
                    .customerPhone(customerEmma.getPhone())
                    .deliveryAddress(emmaOffice.getStreet() + ", " + emmaOffice.getCity() + " " + emmaOffice.getPostalCode())
                    .items(itemsOrder7)
                    .subtotalAmount(subtotal7)
                    .taxAmount(tax7)
                    .deliveryFee(deliveryFee7)
                    .commissionAmount(subtotal7.multiply(BigDecimal.valueOf(0.15)))
                    .totalAmount(total7)
                    .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                    .paymentStatus(PaymentStatus.PENDING)
                    .status(OrderStatus.PLACED)
                    .createdAt(now.minus(2, ChronoUnit.MINUTES))
                    .updatedAt(now.minus(2, ChronoUnit.MINUTES))
                    .build());

            // 9. Create Notifications
            notificationRepository.save(Notification.builder()
                    .userId(customerEmma.getId())
                    .title("Order Delivered!")
                    .message("Your order #" + order1.getId().substring(0, 8).toUpperCase() + " from Trattoria Da Mario was delivered by Alex.")
                    .type("ORDER_DELIVERED")
                    .referenceId(order1.getId())
                    .read(true)
                    .createdAt(now.minus(2, ChronoUnit.HOURS))
                    .build());

            notificationRepository.save(Notification.builder()
                    .userId(customerEmma.getId())
                    .title("Order Ready for Courier")
                    .message("Your sushi feast at Tokyo Zen is packed and waiting for courier dispatch.")
                    .type("ORDER_STATUS")
                    .referenceId(order4.getId())
                    .read(false)
                    .createdAt(now.minus(2, ChronoUnit.MINUTES))
                    .build());

            notificationRepository.save(Notification.builder()
                    .userId(customerSophia.getId())
                    .title("Driver is On The Way!")
                    .message("Alex is heading to your address with your hot quesabirria tacos. ETA: ~12 minutes.")
                    .type("ORDER_STATUS")
                    .referenceId(order3.getId())
                    .read(false)
                    .createdAt(now.minus(5, ChronoUnit.MINUTES))
                    .build());

            // 10. Audit Logs
            auditLogRepository.save(AuditLog.builder()
                    .actorId(admin.getId())
                    .action("SYSTEM_INITIALIZED")
                    .targetType("PLATFORM")
                    .targetId("seed")
                    .details("Database bootstrapped with 4 partner merchants, menus, couriers, and live test orders")
                    .createdAt(now.minus(1, ChronoUnit.DAYS))
                    .build());

            auditLogRepository.save(AuditLog.builder()
                    .actorId(admin.getId())
                    .action("RESTAURANT_APPROVED")
                    .targetType("RESTAURANT")
                    .targetId(r1.getId())
                    .details("Approved Trattoria Da Mario after food safety certificate validation")
                    .createdAt(now.minus(20, ChronoUnit.HOURS))
                    .build());

            auditLogRepository.save(AuditLog.builder()
                    .actorId(admin.getId())
                    .action("DRIVER_APPROVED")
                    .targetType("USER")
                    .targetId(driverAlex.getId())
                    .details("Approved Alex Rider driver profile and verified NY vehicle documents")
                    .createdAt(now.minus(10, ChronoUnit.HOURS))
                    .build());

            log.info("Database seeding successfully completed! 4 restaurants, 13 menu items, 4 coupons, 7 orders across all statuses, reviews and couriers are ready.");

        } catch (Exception e) {
            log.error("Error occurred while seeding database: {}", e.getMessage(), e);
        }
    }

    private void ensurePlatformSettings() {
        if (!platformSettingsRepository.existsById("platform")) {
            platformSettingsRepository.save(PlatformSettings.builder()
                    .id("platform")
                    .commissionRate(BigDecimal.valueOf(15))
                    .currency("USD")
                    .build());
            log.info("Platform settings initialized with 15% commission rate.");
        }
    }

    private User ensureAdminUser() {
        return userRepository.findByEmail("admin@fooddelivery.com").orElseGet(() -> {
            log.info("Bootstrapping platform administrator (admin@fooddelivery.com)...");
            return userRepository.save(User.builder()
                    .email("admin@fooddelivery.com")
                    .fullName("Alex Admin")
                    .passwordHash(passwordEncoder.encode("Admin@123456"))
                    .phone("+1 800-555-0199")
                    .role(Role.ADMIN)
                    .active(true)
                    .approved(true)
                    .createdAt(Instant.now().minus(100, ChronoUnit.DAYS))
                    .build());
        });
    }
}
