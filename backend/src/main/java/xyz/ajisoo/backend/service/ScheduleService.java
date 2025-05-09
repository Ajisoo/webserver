package xyz.ajisoo.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.ajisoo.backend.repository.ScheduleRepository;
import xyz.ajisoo.backend.type.Schedule;
import xyz.ajisoo.backend.type.UserAvailability;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ScheduleService.class);

    @Autowired
    private ScheduleRepository scheduleRepository;

    public List<String> getAllSchedules() {
        LOGGER.info("getAllSchedules() called.");
        return scheduleRepository.findAll().stream().map(Schedule::getClientId).collect(Collectors.toList());
    }

    public Schedule getSchedule(String clientId) {
        LOGGER.info("getSchedule() called with clientId={}", clientId);
        return scheduleRepository.findByClientId(clientId);
    }

    public Schedule setScheduleForUser(String clientId, String userName, String newAvailability) {
        LOGGER.info("setScheduleForUser() called with clientId={}, userName={}", clientId, userName);
        Schedule schedule = scheduleRepository.findByClientId(clientId);
        if (schedule == null) return null;
        List<UserAvailability> availabilities = schedule.getAvailabilities();
        Optional<UserAvailability> existing = availabilities.stream().filter(a -> a.getName().equals(userName)).findFirst();
        if (existing.isPresent()) {
            existing.get().setAvailability(newAvailability);
        } else {
            LOGGER.info("creating new member for clientId={}, userName={}", clientId, userName);
            UserAvailability newUserAvailability = new UserAvailability();
            newUserAvailability.setName(userName);
            newUserAvailability.setAvailability(newAvailability);
            newUserAvailability.setSchedule(schedule);
            availabilities.add(newUserAvailability);
        }
        return scheduleRepository.save(schedule);
    }

    public Schedule removeUserFromSchedule(String clientId, String userName) {
        LOGGER.info("removeUserFromSchedule() called with clientId={}, userName={}", clientId, userName);
        Schedule schedule = scheduleRepository.findByClientId(clientId);
        if (schedule == null) return null;
        List<UserAvailability> availabilities = schedule.getAvailabilities();
        Optional<UserAvailability> existing = availabilities.stream().filter(a -> a.getName().equals(userName)).findFirst();
        existing.ifPresent(availabilities::remove);
        return scheduleRepository.save(schedule);
    }

    public Schedule newSchedule(String clientId) {
        LOGGER.info("newSchedule() called.");
        Schedule schedule = scheduleRepository.findByClientId(clientId);
        if (schedule != null) return null;
        schedule = new Schedule();
        schedule.setClientId(clientId);
        schedule.setAvailabilities(new ArrayList<>());
        return scheduleRepository.save(schedule);
    }
}
