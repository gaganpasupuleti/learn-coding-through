# Study Report: Java Backend Developer — Career Path & Core Skills

*Written by Gagan Pasupuleti*

## Summary

Enterprise Java backend engineering with Java 21 LTS, Spring Boot 3, virtual threads, Jakarta Persistence, microservices, OAuth2 security, and Kubernetes deployment. This path moves from JVM fundamentals through production-grade REST APIs to observable, horizontally scaled services used in banking, e-commerce, and SaaS platforms.

## Learning tracks

**Levels covered:** Beginner, Intermediate, Advanced

## Skill stack by level

### Beginner
- Java syntax and JVM basics
- Object-oriented design (classes, interfaces, inheritance)
- Collections Framework (List, Map, Stream API)
- Exception handling and logging (SLF4J)
- Maven/Gradle project structure
- JUnit 5 unit testing
- Git workflow and code reviews

### Intermediate
- Spring Boot 3 REST API design
- Spring Data JPA and transaction management
- Java 21 virtual threads and structured concurrency
- Spring Security with JWT and OAuth2
- OpenAPI/Swagger documentation
- Docker containerization
- Integration testing with Testcontainers
- PostgreSQL schema design and migrations (Flyway)

### Advanced
- Microservices with Spring Cloud
- Event-driven architecture (Kafka/RabbitMQ)
- Kubernetes deployment and Helm charts
- Distributed tracing (Micrometer, OpenTelemetry)
- Performance profiling and JVM tuning
- Circuit breakers and resilience patterns
- Zero-downtime deployment strategies

## Recommended books (read alongside this report)

### 1. Head First Java — Kathy Sierra & Bert Bates
- **Level:** Beginner
- **Focus:** Visual introduction to Java OOP, classes, and the JVM.
- **Link:** https://www.oreilly.com/library/view/head-first-java/9781492072830/

### 2. Effective Java — Joshua Bloch
- **Level:** Intermediate
- **Focus:** Best practices for Java APIs, generics, enums, and collections.
- **Link:** https://www.oreilly.com/library/view/effective-java/9780134685991/

### 3. Spring Boot in Action — Craig Walls
- **Level:** Intermediate
- **Focus:** Spring Boot 3 REST APIs, security, data access, and production config.
- **Link:** https://www.manning.com/books/spring-boot-in-action

### 4. Java Concurrency in Practice — Brian Goetz
- **Level:** Advanced
- **Focus:** Thread safety, executors, and concurrency for high-throughput servers.
- **Link:** https://jcip.net/

### 5. Cloud Native Spring in Action — Thomas Vitale
- **Level:** Advanced
- **Focus:** Microservices, Kubernetes, and cloud-native Spring patterns.
- **Link:** https://www.manning.com/books/cloud-native-spring-in-action

## End-to-end projects

### Project 1: User Management REST API
- **Level:** Beginner | **Duration:** 2–3 weeks
- **Overview:** Spring Boot 3 CRUD API with JPA, validation, OpenAPI, and Docker Compose + PostgreSQL.
- **Objectives:**
  - Design REST endpoints with proper HTTP status codes
  - Persist User entity with unique email
  - Write JUnit + MockMvc tests
  - Containerize with Flyway migrations
- **Phases:**
  - **Scaffold:** Initialize Spring Boot with web, JPA, validation. Tasks: Create User entity, Configure PostgreSQL. Deliverable: Health endpoint running.
  - **REST Layer:** Build controller, service, DTO layers. Tasks: CRUD endpoints, Global exception handler. Deliverable: Postman collection all green.
  - **Testing:** Unit and integration tests. Tasks: @WebMvcTest, @DataJpaTest. Deliverable: 80%+ coverage report.
  - **Deploy:** Docker Compose stack. Tasks: Dockerfile, docker-compose.yml. Deliverable: README + demo video.
- **Final deliverables:** GitHub repo; OpenAPI spec; Test report; Demo video

### Project 2: E-Commerce Order Microservice
- **Level:** Intermediate | **Duration:** 4–5 weeks
- **Overview:** Order service with inventory checks, JWT auth, Redis cache, and Kafka event publishing.
- **Objectives:**
  - Implement JWT authentication
  - Publish OrderCreated events to Kafka
  - Add Redis caching for product catalog
  - Integration tests with Testcontainers
- **Phases:**
  - **Domain:** Order and OrderItem entities with state machine. Tasks: Order statuses, Inventory client. Deliverable: Domain model docs.
  - **Security:** OAuth2 resource server. Tasks: JWT validation, Role-based endpoints. Deliverable: Secured API.
  - **Events:** Kafka producer/consumer. Tasks: OrderCreated topic, Inventory listener. Deliverable: Event flow diagram.
  - **Observability:** Metrics and structured logging. Tasks: Micrometer, JSON logs. Deliverable: Grafana dashboard screenshot.
- **Final deliverables:** Architecture diagram; Running microservice; Grafana dashboard; Postman collection

### Project 3: Cloud-Native Banking API Platform
- **Level:** Advanced | **Duration:** 6–8 weeks
- **Overview:** Multi-service platform on Kubernetes with virtual threads, circuit breakers, and distributed tracing.
- **Objectives:**
  - Deploy 3 services on Kubernetes with Helm
  - Enable Java 21 virtual threads
  - Implement Resilience4j circuit breakers
  - End-to-end tracing with OpenTelemetry
- **Phases:**
  - **K8s Setup:** Helm charts and namespaces. Tasks: Dev/staging/prod, Ingress + TLS. Deliverable: Cluster running.
  - **Virtual Threads:** High-concurrency payment endpoints. Tasks: Structured concurrency, Load test. Deliverable: JMeter report.
  - **Resilience:** Circuit breakers and retries. Tasks: Resilience4j config, Fallback handlers. Deliverable: Chaos test video.
  - **Tracing:** OpenTelemetry across services. Tasks: Trace IDs in logs, Jaeger UI. Deliverable: Trace screenshot walkthrough.
- **Final deliverables:** Helm charts; Load test report; Jaeger traces; Architecture doc

## Chapters

---

### Track: Beginner

#### Chapter 1: Java 21 Platform and JVM Fundamentals *(Level: Beginner)*

**Chapter focus: Java 21 Platform and JVM Fundamentals** *(Level: Beginner)*

Java 21 is the current LTS release with pattern matching, record types, and sequenced collections. Backend developers compile source to bytecode that runs on the JVM, giving write-once-run-anywhere portability. Understanding the JDK (compiler, runtime, tools) versus the JRE helps you debug classpath and module issues early. Enterprise teams standardize on LTS versions for predictable security patches and long support windows.

Code Reference:
```java
public class App {
    public static void main(String[] args) {
        var message = "Java 21 Backend";
        System.out.println(message);
    }
}
```
What it shows: The var keyword infers type locally; main is the JVM entry point.

### What it actually is
Java is a statically typed, object-oriented language compiled to JVM bytecode for server-side applications.

### When to use it
Choose Java when you need mature tooling, strong typing, vast libraries, and enterprise support.

### Where to use it
Banking cores, insurance systems, large e-commerce backends, and Spring-based microservices.

### Real use example
A payments team ships Java 21 because their SLA requires LTS security updates and proven JVM performance under load.

**Key takeaways**
- Java is a statically typed, object-oriented language compiled to JVM bytecode for server-side applications.
- Choose Java when you need mature tooling, strong typing, vast libraries, and enterprise support.
- A payments team ships Java 21 because their SLA requires LTS security updates and proven JVM performance under load.

#### Chapter 2: Object-Oriented Design in Java *(Level: Beginner)*

**Chapter focus: Object-Oriented Design in Java** *(Level: Beginner)*

Classes encapsulate state and behavior; interfaces define contracts without implementation. Use composition over inheritance to keep services testable and avoid fragile base classes. Records (Java 16+) provide immutable data carriers ideal for DTOs returned from REST APIs. Sealed classes restrict inheritance hierarchies, making domain modeling explicit and safer.

Code Reference:
```java
public record UserDto(Long id, String email, String role) {}

public interface UserService {
    UserDto findById(Long id);
}
```
What it shows: Records auto-generate equals/hashCode; interfaces decouple controllers from implementations.

### What it actually is
OOP organizes code into classes, interfaces, and packages that mirror business domains.

### When to use it
Model every persistent entity, service, and external adapter as typed classes with clear responsibilities.

### Where to use it
Spring @Service classes, JPA @Entity models, and REST response DTOs.

### Real use example
OrderService depends on OrderRepository interface so unit tests swap in an in-memory fake.

**Key takeaways**
- OOP organizes code into classes, interfaces, and packages that mirror business domains.
- Model every persistent entity, service, and external adapter as typed classes with clear responsibilities.
- OrderService depends on OrderRepository interface so unit tests swap in an in-memory fake.

#### Chapter 3: Collections, Streams, and Functional APIs *(Level: Beginner)*

**Chapter focus: Collections, Streams, and Functional APIs** *(Level: Beginner)*

The Collections Framework provides List, Set, Map, and Queue implementations tuned for different access patterns. Streams enable declarative filtering, mapping, and reduction over collections without manual loops. Optional reduces null-pointer bugs by forcing explicit handling of missing values. Backend code uses streams to transform database results into API responses efficiently.

Code Reference:
```java
List<Order> active = orders.stream()
    .filter(o -> o.status() == Status.ACTIVE)
    .sorted(Comparator.comparing(Order::createdAt))
    .toList();
```
What it shows: Stream pipeline filters and sorts orders immutably; toList returns unmodifiable list.

### What it actually is
Collections hold groups of objects; Streams process them with functional operations.

### When to use it
Use streams for in-memory transforms; push heavy filtering to SQL when datasets are large.

### Where to use it
Service-layer aggregation, report generation, and batch preprocessing before persistence.

### Real use example
A dashboard API streams 10,000 orders in memory to compute top customers for the last 24 hours.

**Key takeaways**
- Collections hold groups of objects; Streams process them with functional operations.
- Use streams for in-memory transforms; push heavy filtering to SQL when datasets are large.
- A dashboard API streams 10,000 orders in memory to compute top customers for the last 24 hours.

#### Chapter 4: Maven Build System and Project Layout *(Level: Beginner)*

**Chapter focus: Maven Build System and Project Layout** *(Level: Beginner)*

Maven coordinates projects with groupId, artifactId, and version declared in pom.xml. Standard layout separates src/main/java, src/test/java, and resources for reproducible builds. Dependency management imports BOMs (e.g., Spring Boot parent) to align library versions. Lifecycle phases compile, test, package, and install artifacts to local or remote repositories.

Code Reference:
```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.3.0</version>
</parent>
```
What it shows: Spring Boot parent POM pins compatible dependency versions automatically.

### What it actually is
Maven is the de facto build and dependency manager for Java enterprise projects.

### When to use it
Use Maven or Gradle on every professional Java project; never commit IDE-specific library copies.

### Where to use it
CI pipelines, corporate monorepos, and open-source Java libraries on Maven Central.

### Real use example
Adding spring-boot-starter-data-jpa to pom.xml pulls Hibernate and JDBC drivers transitively.

**Key takeaways**
- Maven is the de facto build and dependency manager for Java enterprise projects.
- Use Maven or Gradle on every professional Java project; never commit IDE-specific library copies.
- Adding spring-boot-starter-data-jpa to pom.

#### Chapter 5: Exception Handling and Logging *(Level: Beginner)*

**Chapter focus: Exception Handling and Logging** *(Level: Beginner)*

Checked exceptions force callers to handle failure modes; unchecked RuntimeExceptions signal programming bugs. Never swallow exceptions—log context and rethrow or map to HTTP status codes at the boundary. SLF4J with Logback provides structured logging levels (DEBUG, INFO, WARN, ERROR). Include correlation IDs in log MDC so distributed requests trace across services.

Code Reference:
```java
try {
    userService.create(dto);
} catch (DuplicateEmailException ex) {
    log.warn("Duplicate email attempt: {}", dto.email());
    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
}
```
What it shows: Domain exceptions translate to 409 Conflict at the REST boundary with structured logging.

### What it actually is
Exceptions signal failure; logging records operational events for debugging and auditing.

### When to use it
Catch at layer boundaries; let service exceptions bubble to @ControllerAdvice handlers.

### Where to use it
Global exception handlers, audit trails, and on-call incident investigation.

### Real use example
Support finds a failed checkout by searching logs for the correlation ID returned to the client.

**Key takeaways**
- Exceptions signal failure; logging records operational events for debugging and auditing.
- Catch at layer boundaries; let service exceptions bubble to @ControllerAdvice handlers.
- Support finds a failed checkout by searching logs for the correlation ID returned to the client.

#### Chapter 6: JUnit 5 and Test-Driven Development *(Level: Beginner)*

**Chapter focus: JUnit 5 and Test-Driven Development** *(Level: Beginner)*

JUnit 5 (Jupiter) uses @Test, @BeforeEach, and assertThat for readable assertions. Parameterized tests run the same logic with multiple inputs, reducing boilerplate. Mockito stubs collaborators so unit tests isolate the class under test. TDD writes a failing test first, implements minimal code, then refactors with confidence.

Code Reference:
```java
@Test
void calculateTotal_appliesTax() {
    var cart = new Cart(List.of(new LineItem("Book", 10.0)));
    assertEquals(10.8, cart.totalWithTax(0.08));
}
```
What it shows: Test verifies tax calculation; assertEquals fails fast on regression.

### What it actually is
Automated tests verify behavior and prevent regressions on every commit.

### When to use it
Write unit tests for services and utilities; integration tests for repositories and controllers.

### Where to use it
CI pipelines block merges when mvn test fails; coverage gates enforce minimum thresholds.

### Real use example
A pull request adding discount logic includes tests proving edge cases for zero and negative prices.

**Key takeaways**
- Automated tests verify behavior and prevent regressions on every commit.
- Write unit tests for services and utilities; integration tests for repositories and controllers.
- A pull request adding discount logic includes tests proving edge cases for zero and negative prices.

---

### Track: Intermediate

#### Chapter 7: Spring Boot 3 REST API Design *(Level: Intermediate)*

**Chapter focus: Spring Boot 3 REST API Design** *(Level: Intermediate)*

Spring Boot 3 runs on Spring Framework 6 with native Jakarta EE namespaces (jakarta.*). Controllers use @RestController and HTTP method annotations to expose resources. DTOs decouple API contracts from JPA entities, preventing lazy-loading leaks in JSON. Problem Details (RFC 7807) standardize error payloads for client-friendly debugging.

Code Reference:
```java
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService service;

    @GetMapping("/{id}")
    public ProductDto get(@PathVariable Long id) {
        return service.findById(id);
    }
}
```
What it shows: @RequiredArgsConstructor injects final dependencies; path variable binds URL segment to parameter.

### What it actually is
Spring Boot auto-configures a servlet stack (or WebFlux) for production REST APIs with minimal boilerplate.

### When to use it
Use Spring Boot for microservices, monolith APIs, and internal tools requiring fast iteration.

### Where to use it
Public mobile backends, partner integrations, admin APIs, and BFF layers.

### Real use example
A retail app calls GET /api/v1/products/42 and receives JSON with price, SKU, and stock level.

**Key takeaways**
- Spring Boot auto-configures a servlet stack (or WebFlux) for production REST APIs with minimal boilerplate.
- Use Spring Boot for microservices, monolith APIs, and internal tools requiring fast iteration.
- A retail app calls GET /api/v1/products/42 and receives JSON with price, SKU, and stock level.

#### Chapter 8: Spring Data JPA and Transactions *(Level: Intermediate)*

**Chapter focus: Spring Data JPA and Transactions** *(Level: Intermediate)*

JPA maps Java objects to relational tables with @Entity, @OneToMany, and lifecycle callbacks. Spring Data derives queries from method names or @Query annotations. @Transactional defines atomic units—rollback on unchecked exceptions by default. N+1 query problems appear when lazy associations load in loops; fix with JOIN FETCH or @EntityGraph.

Code Reference:
```java
@Entity
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderLine> lines = new ArrayList<>();
}
```
What it shows: Bidirectional association mappedBy avoids duplicate foreign keys; cascade persists lines with order.

### What it actually is
JPA is Java's standard ORM; Spring Data adds repository abstraction over EntityManager.

### When to use it
Use JPA for CRUD-heavy domains; consider JDBC/jOOQ for complex reporting queries.

### Where to use it
PostgreSQL and MySQL backends in Spring services with Flyway/Liquibase migrations.

### Real use example
findByCustomerIdAndStatusOrderByCreatedAtDesc returns recent open orders without handwritten SQL.

**Key takeaways**
- JPA is Java's standard ORM; Spring Data adds repository abstraction over EntityManager.
- Use JPA for CRUD-heavy domains; consider JDBC/jOOQ for complex reporting queries.
- findByCustomerIdAndStatusOrderByCreatedAtDesc returns recent open orders without handwritten SQL.

#### Chapter 9: Java 21 Virtual Threads *(Level: Intermediate)*

**Chapter focus: Java 21 Virtual Threads** *(Level: Intermediate)*

Virtual threads are lightweight threads scheduled by the JVM, not the OS. They excel at I/O-bound workloads—HTTP calls, DB queries—without thread-pool exhaustion. Enable with spring.threads.virtual.enabled=true in Spring Boot 3.2+. Avoid pinning virtual threads with synchronized blocks around long I/O inside native code.

Code Reference:
```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> futures = urls.stream()
        .map(url -> executor.submit(() -> fetch(url)))
        .toList();
    futures.forEach(f -> System.out.println(f.get()));
}
```
What it shows: Each URL fetch runs on its own virtual thread; try-with-resources shuts down executor.

### What it actually is
Virtual threads massively increase concurrency for blocking I/O without reactive programming complexity.

### When to use it
Adopt for REST endpoints that call external APIs or databases under high concurrent load.

### Where to use it
Spring Boot servlet containers, batch fetchers, and integration adapters.

### Real use example
An API gateway handles 10,000 concurrent upstream calls using virtual threads instead of a 200-thread platform pool.

**Key takeaways**
- Virtual threads massively increase concurrency for blocking I/O without reactive programming complexity.
- Adopt for REST endpoints that call external APIs or databases under high concurrent load.
- An API gateway handles 10,000 concurrent upstream calls using virtual threads instead of a 200-thread platform pool.

#### Chapter 10: Spring Security and JWT Authentication *(Level: Intermediate)*

**Chapter focus: Spring Security and JWT Authentication** *(Level: Intermediate)*

Spring Security filters authenticate requests before they reach controllers. OAuth2 resource-server support validates JWT access tokens from identity providers. Method security (@PreAuthorize) enforces fine-grained roles on service methods. Never store plaintext passwords—use BCryptPasswordEncoder with sufficient strength factor.

Code Reference:
```java
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health").permitAll()
            .anyRequest().authenticated())
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
        .build();
}
```
What it shows: JWT resource server protects all routes except health; CSRF disabled for stateless APIs.

### What it actually is
Spring Security provides authentication, authorization, and protection against common web attacks.

### When to use it
Apply on every production API handling user data, payments, or admin operations.

### Where to use it
Mobile backends, SPA APIs, microservice meshes with centralized identity.

### Real use example
Only tokens with scope orders:write can POST /api/orders; read-only tokens get 403 Forbidden.

**Key takeaways**
- Spring Security provides authentication, authorization, and protection against common web attacks.
- Apply on every production API handling user data, payments, or admin operations.
- Only tokens with scope orders:write can POST /api/orders; read-only tokens get 403 Forbidden.

#### Chapter 11: Integration Testing with Testcontainers *(Level: Intermediate)*

**Chapter focus: Integration Testing with Testcontainers** *(Level: Intermediate)*

Testcontainers spin up real PostgreSQL, Kafka, or Redis in Docker during tests. @SpringBootTest loads the full application context for end-to-end verification. @DynamicPropertySource injects container host/port into Spring configuration. Tests against real infrastructure catch SQL dialect and serialization bugs mocks miss.

Code Reference:
```java
@SpringBootTest
@Testcontainers
class OrderRepositoryIT {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
    }
}
```
What it shows: PostgreSQL container starts once per test class; datasource URL wired dynamically.

### What it actually is
Integration tests verify components work together against real external systems.

### When to use it
Run in CI with Docker available; complement unit tests, do not replace them entirely.

### Where to use it
Repository tests, Kafka consumer tests, and full API flow verification.

### Real use example
CI catches a Flyway migration bug because Testcontainers applies SQL against real Postgres.

**Key takeaways**
- Integration tests verify components work together against real external systems.
- Run in CI with Docker available; complement unit tests, do not replace them entirely.
- CI catches a Flyway migration bug because Testcontainers applies SQL against real Postgres.

#### Chapter 12: Microservices and Spring Cloud Basics *(Level: Intermediate)*

**Chapter focus: Microservices and Spring Cloud Basics** *(Level: Intermediate)*

Microservices decompose systems into independently deployable services with bounded contexts. Spring Cloud provides service discovery (Eureka), config server, and gateway routing. Synchronous REST between services creates coupling—prefer events for eventually consistent workflows. Each service owns its database; shared tables are an anti-pattern.

Code Reference:
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: orders
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
```
What it shows: Gateway routes /api/orders to order-service via load-balanced service name.

### What it actually is
Microservices trade monolith simplicity for independent scaling and team autonomy.

### When to use it
Adopt when teams and traffic scale beyond a modular monolith's coordination limits.

### Where to use it
Large e-commerce, streaming platforms, and multi-team SaaS products.

### Real use example
The catalog team deploys daily without coordinating releases with the checkout team.

**Key takeaways**
- Microservices trade monolith simplicity for independent scaling and team autonomy.
- Adopt when teams and traffic scale beyond a modular monolith's coordination limits.
- The catalog team deploys daily without coordinating releases with the checkout team.

#### Chapter 13: Dockerizing Spring Boot Applications *(Level: Intermediate)*

**Chapter focus: Dockerizing Spring Boot Applications** *(Level: Intermediate)*

Multi-stage Dockerfiles build with Maven then copy the JAR into a slim JRE image. Use eclipse-temurin:21-jre-alpine or distroless bases to reduce attack surface. Health checks and graceful shutdown hooks let orchestrators drain connections before stop. Never bake secrets into images—inject via environment variables or secret managers.

Code Reference:
```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```
What it shows: Alpine JRE image runs the fat JAR; EXPOSE documents the HTTP port.

### What it actually is
Containers package apps with dependencies for consistent deployment across environments.

### When to use it
Containerize before deploying to Kubernetes, ECS, or any cloud runtime.

### Where to use it
Dev/staging/prod parity, local developer onboarding, and CI/CD artifact promotion.

### Real use example
Developers run docker compose up and get API + Postgres matching production topology.

**Key takeaways**
- Containers package apps with dependencies for consistent deployment across environments.
- Containerize before deploying to Kubernetes, ECS, or any cloud runtime.
- Developers run docker compose up and get API + Postgres matching production topology.

---

### Track: Advanced

#### Chapter 14: Kubernetes Deployment for Java Services *(Level: Advanced)*

**Chapter focus: Kubernetes Deployment for Java Services** *(Level: Advanced)*

Kubernetes schedules pods across nodes with declarative Deployments and Services. Probes (liveness, readiness, startup) integrate with Spring Actuator health endpoints. Resource requests/limits prevent noisy neighbors and enable autoscaling. Ingress controllers terminate TLS and route hostnames to backend services.

Code Reference:
```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 30
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
```
What it shows: Liveness restarts unhealthy pods; readiness removes pods from load balancing until ready.

### What it actually is
Kubernetes orchestrates containerized workloads with self-healing and horizontal scaling.

### When to use it
Use when running multiple Java microservices that need automated rollout and scaling.

### Where to use it
Cloud-native production environments on AWS EKS, GKE, Azure AKS, or on-prem clusters.

### Real use example
Black Friday traffic triggers HPA to scale order-service from 3 to 30 pods automatically.

**Key takeaways**
- Kubernetes orchestrates containerized workloads with self-healing and horizontal scaling.
- Use when running multiple Java microservices that need automated rollout and scaling.
- Black Friday traffic triggers HPA to scale order-service from 3 to 30 pods automatically.

#### Chapter 15: Event-Driven Architecture with Kafka *(Level: Advanced)*

**Chapter focus: Event-Driven Architecture with Kafka** *(Level: Advanced)*

Events capture facts that happened (OrderPlaced) rather than commands (CreateOrder). Kafka provides durable, partitioned logs with consumer groups for parallel processing. Idempotent consumers and exactly-once semantics require careful offset and key design. Schema Registry enforces Avro/JSON schema evolution across producer and consumer teams.

Code Reference:
```java
@KafkaListener(topics = "orders", groupId = "inventory-service")
public void onOrderPlaced(OrderPlacedEvent event) {
    inventoryService.reserve(event.orderId(), event.lines());
}
```
What it shows: Listener consumes order events; groupId ensures each message processed once per consumer group.

### What it actually is
Event-driven systems decouple services through asynchronous, durable message streams.

### When to use it
Use when workflows span teams, require replay, or tolerate eventual consistency.

### Where to use it
Order fulfillment, notification pipelines, audit logs, and CDC-driven integrations.

### Real use example
Inventory service replays last week's events to rebuild stock state after a bug fix.

**Key takeaways**
- Event-driven systems decouple services through asynchronous, durable message streams.
- Use when workflows span teams, require replay, or tolerate eventual consistency.
- Inventory service replays last week's events to rebuild stock state after a bug fix.

#### Chapter 16: Distributed Tracing and Observability *(Level: Advanced)*

**Chapter focus: Distributed Tracing and Observability** *(Level: Advanced)*

Micrometer exports metrics; OpenTelemetry traces requests across service boundaries. Trace context propagates via W3C traceparent headers on outbound HTTP and Kafka messages. Structured JSON logs with traceId tie together metrics, traces, and log lines in Grafana. SLO dashboards alert on error rate and latency percentiles before users notice outages.

Code Reference:
```yaml
management:
  tracing:
    sampling:
      probability: 1.0
  otlp:
    tracing:
      endpoint: http://tempo:4318/v1/traces
```
What it shows: 100% trace sampling in dev; OTLP exporter sends spans to Tempo backend.

### What it actually is
Observability combines metrics, logs, and traces for production system understanding.

### When to use it
Instrument every microservice before production; define SLOs for critical user journeys.

### Where to use it
On-call runbooks, capacity planning, and post-incident reviews.

### Real use example
An engineer traces a 502 error through gateway → auth → orders in Jaeger within two minutes.

**Key takeaways**
- Observability combines metrics, logs, and traces for production system understanding.
- Instrument every microservice before production; define SLOs for critical user journeys.
- An engineer traces a 502 error through gateway → auth → orders in Jaeger within two minutes.

#### Chapter 17: JVM Performance Tuning and Profiling *(Level: Advanced)*

**Chapter focus: JVM Performance Tuning and Profiling** *(Level: Advanced)*

GC choice (G1, ZGC) affects pause times under heap pressure. Async-profiler and JFR reveal hot methods and allocation hotspots without heavy overhead. Connection pool sizing, thread counts, and cache TTLs often dominate latency more than micro-optimizations. Load test with realistic payloads before tuning flags in production.

Code Reference:
```bash
java -XX:+UseZGC -Xms512m -Xmx512m -jar app.jar
```
What it shows: ZGC targets low pause times; fixed heap avoids resize churn during steady state.

### What it actually is
JVM tuning balances throughput, latency, and memory for server workloads.

### When to use it
Profile when latency SLOs break under load or GC logs show frequent long pauses.

### Where to use it
High-throughput payment processors, search indexing, and batch ETL services.

### Real use example
Switching to ZGC drops P99 latency from 800ms to 120ms during promotion spikes.

**Key takeaways**
- JVM tuning balances throughput, latency, and memory for server workloads.
- Profile when latency SLOs break under load or GC logs show frequent long pauses.
- Switching to ZGC drops P99 latency from 800ms to 120ms during promotion spikes.

#### Chapter 18: Resilience Patterns and Zero-Downtime Deploys *(Level: Advanced)*

**Chapter focus: Resilience Patterns and Zero-Downtime Deploys** *(Level: Advanced)*

Circuit breakers stop cascading failures when downstream services degrade. Resilience4j integrates with Spring Boot for retry, rate limit, bulkhead, and circuit breaker. Blue-green and canary deployments shift traffic gradually while monitoring error budgets. Feature flags decouple code deployment from feature activation for safer releases.

Code Reference:
```java
@CircuitBreaker(name = "inventory", fallbackMethod = "fallbackCheck")
public StockStatus checkStock(Long sku) {
    return inventoryClient.getStock(sku);
}
```
What it shows: Circuit opens after failure threshold; fallback returns cached or degraded response.

### What it actually is
Resilience patterns keep systems available when dependencies fail or deploys roll out.

### When to use it
Apply breakers on all external HTTP calls; use canary releases for high-risk changes.

### Where to use it
Mission-critical checkout, payment authorization, and multi-region active-active setups.

### Real use example
During inventory outage, checkout shows 'limited stock info' instead of total failure.

**Key takeaways**
- Resilience patterns keep systems available when dependencies fail or deploys roll out.
- Apply breakers on all external HTTP calls; use canary releases for high-risk changes.
- During inventory outage, checkout shows 'limited stock info' instead of total failure.

---

*Family: Java Backend Developer | Level: Beginner to Advanced*

**Official sources & free libraries**
- https://docs.oracle.com/en/java/javase/21/
- https://docs.spring.io/spring-boot/docs/current/reference/html/
- https://spring.io/guides
- https://jakarta.ee/specifications/persistence/3.1/
- https://kubernetes.io/docs/tutorials/
- https://openjdk.org/jeps/444