// Mock product catalog for the demo storefront.
// In a real app this would be fetched from an API.

// To keep code readable while still showing scale,
// we define a small set of base products across many categories
// and then generate a larger catalog (500 items) from them.

const baseProducts = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphones",
    price: 5999,
    image:
      "https://via.placeholder.com/640x480.png?text=Wireless+Headphones",
    rating: 4.6,
    reviewsCount: 184,
    category: "Audio",
    stock: 14,
    description:
      "Comfortable over-ear design with rich sound and active noise cancelling.",
    specs: {
      Brand: "SoundMax",
      Connectivity: "Bluetooth 5.0",
      "Battery life": "32 hours",
      "Noise cancelling": "Active",
      Warranty: "1 year"
    }
  },
  {
    id: 2,
    name: "Mechanical Keyboard (Brown Switches)",
    price: 3999,
    image:
      "https://via.placeholder.com/640x480.png?text=Mechanical+Keyboard",
    rating: 4.7,
    reviewsCount: 251,
    category: "Accessories",
    stock: 20,
    description:
      "Tactile mechanical keyboard with white backlight and compact layout.",
    specs: {
      Brand: "KeyCraft",
      Switches: "Brown",
      Layout: "TKL (87 keys)",
      "Backlight color": "White",
      Connection: "USB-C"
    }
  },
  {
    id: 3,
    name: "1080p HD Webcam",
    price: 2499,
    image: "https://via.placeholder.com/640x480.png?text=HD+Webcam",
    rating: 4.3,
    reviewsCount: 96,
    category: "Accessories",
    stock: 8,
    description:
      "Crystal-clear 1080p video with dual noise-reducing microphones.",
    specs: {
      Brand: "ClearView",
      Resolution: "1920 x 1080",
      Microphone: "Dual built-in",
      "Field of view": "78°",
      Mount: "Monitor clip / tripod"
    }
  },
  {
    id: 4,
    name: "USB-C 65W Fast Charger",
    price: 1499,
    image: "https://via.placeholder.com/640x480.png?text=USB-C+Charger",
    rating: 4.5,
    reviewsCount: 312,
    category: "Power",
    stock: 0,
    description:
      "Compact 65W fast charger for laptops, tablets, and phones.",
    specs: {
      Brand: "ChargeFlow",
      Output: "USB-C PD 65W",
      Ports: "1 x USB-C, 1 x USB-A",
      Warranty: "1 year"
    }
  },
  {
    id: 5,
    name: "Smart Fitness Band",
    price: 2199,
    image: "https://via.placeholder.com/640x480.png?text=Fitness+Band",
    rating: 4.2,
    reviewsCount: 421,
    category: "Wearables",
    stock: 35,
    description:
      "Track heart rate, steps, and sleep with a bright AMOLED display.",
    specs: {
      Brand: "FitBeam",
      Display: '1.1" AMOLED',
      "Water resistance": "5 ATM",
      Battery: "Up to 10 days",
      Sensors: "Heart rate, SpO2, accelerometer"
    }
  },
  {
    id: 6,
    name: "True Wireless Earbuds",
    price: 2799,
    image: "https://via.placeholder.com/640x480.png?text=Wireless+Earbuds",
    rating: 4.4,
    reviewsCount: 305,
    category: "Audio",
    stock: 18,
    description:
      "Pocketable earbuds with clear sound and low-latency mode.",
    specs: {
      Brand: "Pulse",
      Connectivity: "Bluetooth 5.2",
      "Battery life": "5 hours + 20 hours case",
      "Water resistance": "IPX4"
    }
  },
  {
    id: 7,
    name: "14-inch Ultrabook Laptop",
    price: 64999,
    image: "https://via.placeholder.com/640x480.png?text=Ultrabook+Laptop",
    rating: 4.5,
    reviewsCount: 143,
    category: "Laptops",
    stock: 12,
    description:
      "Slim and light laptop for productivity and learning with long battery life.",
    specs: {
      Brand: "Hysteresis",
      Processor: "Intel Core i5",
      RAM: "16 GB",
      Storage: "512 GB SSD",
      Display: '14" FHD IPS'
    }
  },
  {
    id: 8,
    name: "27-inch IPS Monitor",
    price: 18999,
    image: "https://via.placeholder.com/640x480.png?text=IPS+Monitor",
    rating: 4.4,
    reviewsCount: 89,
    category: "Monitors",
    stock: 10,
    description:
      "27-inch IPS display with thin bezels, perfect for work and casual gaming.",
    specs: {
      Brand: "ViewLine",
      Resolution: "2560 x 1440",
      Refresh: "75 Hz",
      Ports: "HDMI, DisplayPort"
    }
  },
  {
    id: 9,
    name: "Portable SSD 1TB",
    price: 9999,
    image: "https://via.placeholder.com/640x480.png?text=Portable+SSD",
    rating: 4.6,
    reviewsCount: 204,
    category: "Storage",
    stock: 28,
    description:
      "High-speed external SSD for quick backups and media editing.",
    specs: {
      Brand: "DataJet",
      Capacity: "1 TB",
      Interface: "USB-C 3.2",
      "Read speed": "1000 MB/s"
    }
  },
  {
    id: 10,
    name: "Smart LED Light Strip",
    price: 1999,
    image: "https://via.placeholder.com/640x480.png?text=LED+Light+Strip",
    rating: 4.1,
    reviewsCount: 178,
    category: "Smart Home",
    stock: 40,
    description:
      "Wi‑Fi enabled LED strip with app and voice assistant support.",
    specs: {
      Brand: "GlowHome",
      Length: "5 m",
      Connectivity: "Wi‑Fi",
      "Voice control": "Supported"
    }
  }
];

function buildCatalog(targetCount = 500) {
  const catalog = [...baseProducts];
  let nextId = baseProducts.length + 1;

  while (catalog.length < targetCount) {
    for (const template of baseProducts) {
      if (catalog.length >= targetCount) break;
      const index = catalog.length + 1;
      const priceBump = (index % 5) * 100;
      const ratingOffset = (index % 3) * 0.1;
      const baseRating = template.rating || 4.2;
      const rating = Math.max(3.8, Math.min(4.9, baseRating + ratingOffset));

      const stock =
        template.stock === 0
          ? 0
          : 5 + (index % 25);

      catalog.push({
        ...template,
        id: nextId++,
        name: `${template.name} #${index}`,
        price: template.price + priceBump,
        rating,
        reviewsCount: template.reviewsCount + (index % 60),
        stock
      });
    }
  }

  return catalog;
}

const products = buildCatalog(500);

function getProductById(id) {
  return products.find((p) => p.id === Number(id));
}

function formatPriceINR(amount) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  } catch (_) {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
}

