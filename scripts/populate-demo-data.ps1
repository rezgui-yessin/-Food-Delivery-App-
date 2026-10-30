param(
    [string]$ApiUrl = "http://localhost:8081/api",
    [string]$Password = "DemoFoodRush2026!",
    [string]$OwnerEmail = "demo.owner@foodrush.local",
    [string]$CustomerEmail = "demo.customer@foodrush.local",
    [string]$DriverEmail = "demo.driver@foodrush.local"
)

$ErrorActionPreference = "Stop"

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body,
        [string]$Token
    )
    $headers = @{}
    if ($Token) { $headers.Authorization = "Bearer $Token" }
    $params = @{
        Method = $Method
        Uri = "$ApiUrl$Path"
        Headers = $headers
        ContentType = "application/json"
    }
    if ($null -ne $Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10) }
    try { return Invoke-RestMethod @params }
    catch {
        $detail = $_.ErrorDetails.Message
        throw "API $Method $Path failed: $detail"
    }
}

function Get-OrRegister {
    param([string]$Email, [string]$FullName, [string]$Role)
    try {
        $login = Invoke-Api "POST" "/auth/login" @{ email = $Email; password = $Password }
        return $login
    } catch {
        return Invoke-Api "POST" "/auth/register" @{
            email = $Email
            password = $Password
            fullName = $FullName
            role = $Role
        }
    }
}

Write-Host "Connecting to $ApiUrl"
$owner = Get-OrRegister $OwnerEmail "Demo Restaurant Owner" "RESTAURANT_OWNER"
$customer = Get-OrRegister $CustomerEmail "Demo Customer" "CUSTOMER"
$driver = Get-OrRegister $DriverEmail "Demo Delivery Driver" "DELIVERY_DRIVER"

$ownerToken = $owner.token
$customerToken = $customer.token
$driverToken = $driver.token

Invoke-Api "PUT" "/drivers/me" @{
    fullName = "Demo Delivery Driver"; phone = "+15550101012"
    vehicleType = "Electric bike"; vehiclePlate = "DEMO-01"; deliveryZone = "Demo City Central"
} $driverToken | Out-Null

$restaurants = Invoke-Api "GET" "/restaurants" $null $ownerToken
$restaurant = $restaurants | Where-Object { $_.name -eq "FoodRush Demo Kitchen" } | Select-Object -First 1
if (-not $restaurant) {
    $restaurant = Invoke-Api "POST" "/restaurants" @{
        name = "FoodRush Demo Kitchen"
        description = "A realistic demonstration restaurant for the FoodRush platform."
        address = "12 Market Street, Demo City"
        phone = "+15550101010"
        cuisineType = "Mediterranean"
        open = $true
        openingHours = @{
            monday = "10:00-22:00"; tuesday = "10:00-22:00"; wednesday = "10:00-22:00"
            thursday = "10:00-22:00"; friday = "10:00-23:00"; saturday = "10:00-23:00"; sunday = "11:00-21:00"
        }
    } $ownerToken
}

$categories = Invoke-Api "GET" "/restaurants/$($restaurant.id)/categories" $null $ownerToken
foreach ($categoryName in @("Signature Meals", "Sides", "Desserts")) {
    if (-not ($categories | Where-Object { $_.name -eq $categoryName })) {
        Invoke-Api "POST" "/restaurants/$($restaurant.id)/categories" @{
            name = $categoryName; description = "$categoryName from FoodRush Demo Kitchen"
            sortOrder = $categories.Count; active = $true
        } $ownerToken | Out-Null
    }
}

$menu = Invoke-Api "GET" "/restaurants/$($restaurant.id)/menu-items" $null $ownerToken
$items = @(
    @{ name = "Harissa Chicken Bowl"; description = "Roasted chicken, couscous, herbs and tahini."; price = 14.50; category = "Signature Meals"; available = $true; stockQuantity = 40; preparationTimeMinutes = 20; sortOrder = 1 },
    @{ name = "Falafel Mezze"; description = "Crispy falafel with hummus, salad and warm pita."; price = 11.25; category = "Signature Meals"; available = $true; stockQuantity = 35; preparationTimeMinutes = 15; sortOrder = 2 },
    @{ name = "Seasoned Fries"; description = "Golden fries with sumac and garlic aioli."; price = 5.50; category = "Sides"; available = $true; stockQuantity = 60; preparationTimeMinutes = 8; sortOrder = 3 },
    @{ name = "Baklava Trio"; description = "Three pieces of honey pistachio baklava."; price = 6.25; category = "Desserts"; available = $true; stockQuantity = 25; preparationTimeMinutes = 5; sortOrder = 4 }
)
foreach ($item in $items) {
    if (-not ($menu | Where-Object { $_.name -eq $item.name })) {
        Invoke-Api "POST" "/restaurants/$($restaurant.id)/menu-items" $item $ownerToken | Out-Null
    }
}

$addresses = Invoke-Api "GET" "/users/me/addresses" $null $customerToken
if (-not $addresses) {
    Invoke-Api "POST" "/users/me/addresses" @{
        label = "Home"; street = "45 Demo Avenue"; city = "Demo City"; postalCode = "10001"; isDefault = $true
    } $customerToken | Out-Null
}

$favorites = Invoke-Api "GET" "/users/me/favorites" $null $customerToken
if (-not ($favorites | Where-Object { $_.id -eq $restaurant.id })) {
    Invoke-Api "POST" "/users/me/favorites/$($restaurant.id)" @{} $customerToken | Out-Null
}

$menu = Invoke-Api "GET" "/restaurants/$($restaurant.id)/menu-items" $null $customerToken
$featured = $menu | Where-Object { $_.name -eq "Harissa Chicken Bowl" } | Select-Object -First 1
$cart = Invoke-Api "GET" "/cart" $null $customerToken
if (-not $cart.items -or -not ($cart.items | Where-Object { $_.menuItemId -eq $featured.id })) {
    Invoke-Api "POST" "/cart/items" @{ menuItemId = $featured.id; quantity = 1; specialInstructions = "Demo order" } $customerToken | Out-Null
}

$existingOrders = Invoke-Api "GET" "/orders" $null $customerToken
if (-not ($existingOrders | Where-Object { $_.deliveryAddress -eq "45 Demo Avenue, Demo City 10001" })) {
    Invoke-Api "POST" "/cart/checkout" @{
        customerName = "Demo Customer"; customerPhone = "+15550101011"
        deliveryAddress = "45 Demo Avenue, Demo City 10001"
        paymentMethod = "CASH_ON_DELIVERY"
    } $customerToken | Out-Null
}

$reviews = Invoke-Api "GET" "/restaurants/$($restaurant.id)/reviews" $customerToken
if (-not $reviews) {
    Invoke-Api "POST" "/restaurants/$($restaurant.id)/reviews" @{
        rating = 5; comment = "Fresh food, clear portions, and a fast demo delivery."
    } $customerToken | Out-Null
}

$verifiedRestaurants = Invoke-Api "GET" "/restaurants/search?query=FoodRush&page=0&size=12&sort=name" $null $customerToken
$verifiedMenu = Invoke-Api "GET" "/restaurants/$($restaurant.id)/menu-items" $null $customerToken
$verifiedOrders = Invoke-Api "GET" "/orders" $null $customerToken
$verifiedReviews = Invoke-Api "GET" "/restaurants/$($restaurant.id)/reviews" $null $customerToken
$verifiedNotifications = Invoke-Api "GET" "/users/me/notifications" $null $customerToken

Write-Host "Demo data is ready."
Write-Host "Restaurant: $($restaurant.id); menu items: $($verifiedMenu.Count); customer orders: $($verifiedOrders.Count); reviews: $($verifiedReviews.Count); notifications: $($verifiedNotifications.Count); search results: $($verifiedRestaurants.totalItems)"
