# E-commerce Website with Virtual Assistant

A modern e-commerce platform for electronics shopping featuring an integrated AI-powered virtual assistant that provides 24/7 customer support and intelligent product recommendations.

## 🚀 Live Demo

Visit our live demo: **[https://dev.truongson.shop/](https://dev.truongson.shop/)**

## 📋 Features

### Core E-commerce Features
- **Product Catalog**: Browse through a comprehensive collection of electronics
- **Advanced Search**: Find products quickly with smart filtering options
- **Shopping Cart**: Add, remove, and manage items with ease
- **Secure Checkout**: Streamlined purchasing process
- **User Authentication**: Secure login and registration system

### AI Virtual Assistant
- **24/7 Customer Support**: Get instant help anytime
- **Product Consultation**: Receive personalized product recommendations
- **Smart Cart Management**: AI-assisted shopping cart operations
- **Intelligent Checkout**: Automated assistance during the purchase process
- **Multi-agent Architecture**: Sophisticated conversational AI system

## 🛠️ Technology Stack

### Backend (Java 17)
- **Spring Boot 3.2.2**: Core backend framework
- **Spring Cloud 2023.0.0**: Microservices infrastructure
- **Spring Security**: Authentication and authorization
- **JWT**: Token-based authentication
- **MySQL**: Primary database for structured data
- **MongoDB**: Document database for flexible data
- **Netflix Eureka**: Service discovery
- **Spring Cloud Config**: Centralized configuration
- **OpenFeign**: Service-to-service communication

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Redux Toolkit**: State management
- **React Router**: Client-side routing
- **Chart.js**: Data visualization
- **Material-UI**: Component library
- **Axios**: HTTP client

### AI & Machine Learning
- **Python**: AI/ML processing and data analysis
- **Google Agent Development Kit (ADK)**: Multi-agent conversational AI
- **Computer Vision**: Advanced image processing capabilities
- **RAG (Retrieval-Augmented Generation)**: Enhanced AI responses

### DevOps & Deployment
- **Docker**: Containerization
- **Jib**: Container image building
- **Docker Compose**: Multi-container deployment

### Testing & Quality Assurance
- **JUnit 5**: Unit testing framework
- **Mockito**: Mocking framework
- **JaCoCo**: Code coverage analysis
- **Spring Boot Test**: Integration testing
- **Custom Metrics**: Performance evaluation for AI assistant

## 🏗️ Architecture

The system follows a microservices architecture with the following components:

### Microservices
- **API Gateway**: Entry point for all client requests
- **Discovery Service**: Netflix Eureka for service registry
- **Config Service**: Centralized configuration management
- **User Service**: User management and authentication
- **Product Service**: Product catalog and management
- **Order Service**: Order processing and management
- **Inventory Service**: Stock management
- **Cart Service**: Shopping cart functionality
- **Payment Service**: Payment processing
- **Chatbot Service**: AI-powered virtual assistant (Python)

### Data Layer
- **MySQL**: User data, orders, products, inventory
- **MongoDB**: Product reviews, logs, flexible data

## 🏗️ Architecture

The system follows a microservices architecture with the following components:

Website system:
<img width="485" alt="{73BDB0EF-7EFC-44D4-9C80-2B7B911D12C2}" src="https://github.com/user-attachments/assets/95bde972-9c76-42a3-bae5-1e0a831a58eb" />

Virtual assistant system:
<img width="513" alt="{B65158DB-ADA3-45BA-BC42-5870E0E2E17C}" src="https://github.com/user-attachments/assets/03bcaa30-6876-41b4-9852-a6d0b4edddac" />


## 🚀 Getting Started

### Prerequisites
- **Java 17**: Required for Spring Boot services
- **Node.js 18+**: For React frontend
- **Python 3.8+**: For AI chatbot service
- **Maven 3.8+**: For Java project management
- **Docker & Docker Compose**: For containerized deployment
- **MySQL 8.0+**: Primary database
- **MongoDB 6.0+**: Document database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TruongSon421/ecommerce-website-chatbot.git
   cd ecommerce-website-chatbot
   ```

2. **Start Infrastructure Services**
   ```bash
   # Start databases and other infrastructure
   docker-compose up -d mysql mongodb
   ```

3. **Backend Services Setup**
   ```bash
   # Build all microservices
   mvn clean install
   
   # Start services in order:
   # 1. Discovery Service
   cd discovery-service
   mvn spring-boot:run &
   
   # 2. Config Service
   cd ../config-service
   mvn spring-boot:run &
   
   # 3. API Gateway
   cd ../api-gateway
   mvn spring-boot:run &
   
   # 4. Other services (can be started in parallel)
   cd ../user-service && mvn spring-boot:run &
   cd ../product-service && mvn spring-boot:run &
   cd ../order-service && mvn spring-boot:run &
   cd ../cart-service && mvn spring-boot:run &
   cd ../inventory-service && mvn spring-boot:run &
   cd ../payment-service && mvn spring-boot:run &
   cd ../notification-service && mvn spring-boot:run &
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **AI Chatbot Setup**
   ```bash
   cd chatbot
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run the chatbot service
   cd src
   python main.py
   ```

6. **Docker Deployment (Alternative)**
   ```bash
   # Build and start all services
   docker-compose up --build
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=ecommerce_db
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_mysql_password

MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=ecommerce_reviews

# Service Ports
EUREKA_SERVER_PORT=8761
CONFIG_SERVER_PORT=8888
API_GATEWAY_PORT=8080
USER_SERVICE_PORT=8081
PRODUCT_SERVICE_PORT=8082
ORDER_SERVICE_PORT=8083
CART_SERVICE_PORT=8084
INVENTORY_SERVICE_PORT=8085
PAYMENT_SERVICE_PORT=8086
NOTIFICATION_SERVICE_PORT=8087

# Google ADK Configuration
GOOGLE_API_KEY=your_google_adk_api_key
OPENAI_API_KEY=your_openapi_api_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_CHATBOT_URL=http://localhost:5000

```

## 🧪 Testing

### Running Tests
```bash
# Backend tests for all services
mvn test

# Generate coverage report with JaCoCo
mvn jacoco:report

# Test specific service
cd product-service
mvn test

# Frontend tests
cd frontend
npm test

# Chatbot service tests
cd chatbot
python -m pytest src/tests/

# Run all tests with coverage
mvn clean test jacoco:report
```

### Service Endpoints
- **API Gateway**: http://localhost:8080
- **Frontend**: http://localhost:5173
- **Eureka Dashboard**: http://localhost:8761
- **Config Server**: http://localhost:8888
- **Chatbot Service**: http://localhost:5000

### Docker Services
```bash
# Start individual services
docker-compose up mysql mongodb

# View logs
docker-compose logs -f chatbot

# Scale services
docker-compose up --scale product-service=2
```

### Test Coverage
- Backend: High code coverage achieved using JUnit and JaCoCo
- Custom metrics implemented for AI assistant performance evaluation
- Comprehensive integration testing for all microservices

## 📊 Performance Metrics

The system includes comprehensive monitoring and metrics:

### Backend Metrics
- **Service Health**: Spring Boot Actuator endpoints
- **Response Time**: API performance monitoring
- **Error Rate**: Request failure tracking
- **Database Performance**: Query optimization metrics

### AI Assistant Metrics
- **Response Time**: Chatbot query processing speed
- **Accuracy**: Intent recognition and response quality
- **User Satisfaction**: Custom evaluation metrics
- **Multi-agent Performance**: Agent collaboration effectiveness

### Frontend Metrics
- **User Experience**: Page load times, interaction tracking
- **Conversion Rates**: Shopping cart to purchase conversion
- **Session Duration**: User engagement metrics

### System Monitoring
- **Resource Utilization**: CPU, memory, disk usage
- **Service Discovery**: Eureka registration status
- **Circuit Breaker**: Resilience pattern monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: TruongSon421
- **Project Type**: Computer Vision & AI Integration

## 📞 Support

For support and questions:
- 🌐 **Live Demo**: [https://dev.truongson.shop/](https://dev.truongson.shop/)
- 📧 **GitHub Issues**: [Create an issue](https://github.com/TruongSon421/ecommerce-website-chatbot/issues)
- 💬 **AI Assistant**: Try our virtual assistant on the live demo for instant help

## 🔄 Recent Updates

- ✅ Implemented 10 microservices architecture with Spring Cloud
- ✅ Enhanced AI chatbot with multi-agent architecture and RAG
- ✅ Added comprehensive product catalog with MySQL and MongoDB
- ✅ Implemented JWT-based authentication and authorization
- ✅ Added shopping cart and order management functionality
- ✅ Integrated payment processing and notification systems
- ✅ Deployed with Docker containerization
- ✅ Achieved high test coverage with JUnit and JaCoCo
- ✅ Deployed live demo environment at dev.truongson.shop

---

**Built with ❤️ using Spring Boot, TypeScript, Python, and Google ADK**
