package food_delivery_api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private static final int LIMIT = 120;
    private static final long WINDOW_SECONDS = 60;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String key = request.getRemoteAddr();
        long now = Instant.now().getEpochSecond();
        Window window = windows.compute(key, (ignored, current) ->
                current == null || now - current.startedAt() >= WINDOW_SECONDS
                        ? new Window(now, 1) : new Window(current.startedAt(), current.count() + 1));
        if (window.count() > LIMIT) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", "60");
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded\"}");
            return;
        }
        chain.doFilter(request, response);
    }

    private record Window(long startedAt, int count) {}
}
