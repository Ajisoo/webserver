package xyz.ajisoo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.ajisoo.backend.type.Schedule;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    Schedule findByClientId(String clientId);
}
