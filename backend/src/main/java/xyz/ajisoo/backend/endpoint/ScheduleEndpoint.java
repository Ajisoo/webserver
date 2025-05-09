package xyz.ajisoo.backend.endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.ajisoo.backend.service.ScheduleService;
import xyz.ajisoo.backend.type.Schedule;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/schedule")
public class ScheduleEndpoint {

    @Autowired
    ScheduleService scheduleService;

    @GetMapping("/")
    public ResponseEntity<List<String>> getAllSchedules() {
        List<String> clientIds = scheduleService.getAllSchedules();
        return ResponseEntity.ok(clientIds);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Schedule> getSchedule(@PathVariable String id) {
        Schedule schedule = scheduleService.getSchedule(id);
        if (schedule != null) {
            return ResponseEntity.ok(schedule);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/{user}")
    public ResponseEntity<Schedule> setScheduleForUser(@PathVariable String id, @PathVariable String user, @RequestBody String availability) {
        Schedule schedule = scheduleService.setScheduleForUser(id, user, availability);
        if (schedule != null) {
            return ResponseEntity.ok(schedule);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}/{user}")
    public ResponseEntity<Schedule> removeUserFromSchedule(@PathVariable String id, @PathVariable String user) {
        Schedule schedule = scheduleService.removeUserFromSchedule(id, user);
        if (schedule != null) {
            return ResponseEntity.ok(schedule);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/new")
    public ResponseEntity<Schedule> newSchedule() {
        Schedule schedule = scheduleService.newSchedule(UUID.randomUUID().toString());
        return ResponseEntity.ok(schedule);
    }
}
