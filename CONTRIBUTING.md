# Backend Interview Questions (Readable Notes)

## 1. Explain async/await in .NET

`async/await` converts code into a **state machine**.
It pauses execution at `await` and resumes later using continuations—**without blocking threads**.

---

## 2. What happens if you don’t use await?

* You only get a `Task` back (fire-and-forget)
* Risks:

  * Unobserved exceptions
  * Race conditions
  * Lost execution flow
  * Scoped services breaking (common bug)

---

## 3. Task vs Thread vs Parallel.ForEach

* **Thread** → Low-level execution unit
* **Task** → Abstraction over threads (ThreadPool)
* **Parallel.ForEach** → Runs loops in parallel using multiple threads

---

## 4. How to optimize an API handling 10k requests/sec?

* Use async everywhere (DB, HTTP, I/O)
* Avoid blocking (`.Result`, `.Wait()`)
* Use caching
* Optimize DB:

  * Indexing
  * Avoid N+1 queries
  * Pagination
* Batch operations (`Task.WhenAll`)
* Scale horizontally

---

## 5. IQueryable vs IEnumerable vs List

* **IQueryable** → Executes queries in DB
* **IEnumerable** → Executes in memory (read-only)
* **List** → In-memory + mutable

---

## 6. Pagination in High-Performance Systems

Prefer **cursor-based pagination**:

* Faster for large datasets
* Consistent results

Avoid **offset-based pagination**:

* Slow for deep pages
* Can return inconsistent data

---

## 7. Filtering in High-Performance Systems

* Use query parameters
* Filter on indexed fields
* For complex filters → use DTOs

---

## 8. Sorting in High-Performance Systems

* Allow only specific fields
* Ensure deterministic sorting
* Use:

  * Primary field
  * Tie-breaker (e.g., ID)

---

## 9. Rate Limiting Strategy

* Apply at API Gateway
* Use:

  * Token bucket / Leaky bucket
* Limit by:

  * User / API key / IP
* Separate limits for read/write APIs

---

## 10. Offset vs Cursor Pagination

### Offset

* Jump to any page
* Slower for large data
* Can lose consistency

### Cursor

* Only next/previous navigation
* Faster and consistent
* No skipped data

---

## 11. What is Dependency Injection (DI)?

A design pattern where dependencies are provided externally instead of being created inside the class.

---

## 12. Transient vs Scoped vs Singleton

* **Transient** → New instance every time
* **Scoped** → One per request
* **Singleton** → One for entire app lifecycle

---

## 13. Service Lifetime Bugs (Important)

### Scoped inside Singleton (Common Bug)

* Scoped object gets disposed
* Causes runtime errors

### Singleton with Mutable State

* Shared across users
* Leads to data leaks

### Scoped in Background Service

* No HTTP scope
* Causes crashes

---

## 14. ASP.NET Core Middleware Pipeline

Middleware:

* Processes request/response
* Can call next middleware
* Can stop pipeline

Examples:

* Authentication
* Authorization
* Routing

---

## 15. Middleware vs Filters

* **Middleware** → Runs before routing (global)
* **Filters** → Run after routing (controller/action level)

---

## 16. What are Filters?

Filters run around controller actions.

### Example:

```csharp
public class LogActionFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        Console.WriteLine("Before action");
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        Console.WriteLine("After action");
    }
}
```

---

## 17. Garbage Collection in .NET

Automatic memory management system.

### Steps:

1. **Marking** → Identify unused objects
2. **Sweeping** → Remove them
3. **Compacting** → Reorganize memory

---