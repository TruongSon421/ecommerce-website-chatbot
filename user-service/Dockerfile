FROM eclipse-temurin:17-jdk-alpine

# Cài đặt Maven
RUN apk add --no-cache maven

WORKDIR /app

# Copy pom.xml riêng trước để tận dụng Docker cache cho dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Khi build, chỉ copy source code và build
COPY src ./src
RUN mvn package -DskipTests

# Sử dụng shell để mở rộng wildcard
CMD java -jar target/*.jar