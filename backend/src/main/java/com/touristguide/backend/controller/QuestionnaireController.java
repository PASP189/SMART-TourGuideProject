package com.touristguide.backend.controller;

import com.touristguide.backend.model.Questionnaire;
import com.touristguide.backend.model.UserAccount;
import com.touristguide.backend.repository.QuestionnaireRepository;
import com.touristguide.backend.repository.UserAccountRepository;
import org.springframework.web.bind.annotation.*;

import com.touristguide.backend.exception.ResourceNotFoundException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questionnaires")
@CrossOrigin(origins = "*")
public class QuestionnaireController {

    private final QuestionnaireRepository questionnaireRepository;
    private final UserAccountRepository userAccountRepository;

    public QuestionnaireController(QuestionnaireRepository questionnaireRepository,
                                   UserAccountRepository userAccountRepository) {
        this.questionnaireRepository = questionnaireRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @GetMapping
    public List<Questionnaire> getAllQuestionnaires() {
        return questionnaireRepository.findAll();
    }

    @GetMapping("/{id}")
    public Questionnaire getQuestionnaireById(@PathVariable Long id) {
        return questionnaireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Questionnaire not found"));
    }

    // Expects JSON like:
    // { "userId": 5, "travelType": "Nature", "budget": "$300", "days": "5 Days",
    //   "companions": "Family", "climate": "Cool", "accommodation": "Hotel",
    //   "transport": "Private Vehicle", "interests": "Wildlife, Hiking" }
    @PostMapping
    public Questionnaire submitQuestionnaire(@RequestBody Map<String, String> body) {

        Questionnaire q = new Questionnaire();

        String userIdStr = body.get("userId");
        if (userIdStr != null && !userIdStr.isBlank()) {
            UserAccount user = userAccountRepository.findById(Long.valueOf(userIdStr))
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            q.setUser(user);
        }

        q.setTravelType(body.get("travelType"));
        q.setBudget(body.get("budget"));
        q.setDays(body.get("days"));
        q.setCompanions(body.get("companions"));
        q.setClimate(body.get("climate"));
        q.setAccommodation(body.get("accommodation"));
        q.setTransport(body.get("transport"));
        q.setInterests(body.get("interests"));

        return questionnaireRepository.save(q);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteQuestionnaire(@PathVariable Long id) {
        if (!questionnaireRepository.existsById(id)) {
            throw new ResourceNotFoundException("Questionnaire not found");
        }
        questionnaireRepository.deleteById(id);

        Map<String, String> result = new HashMap<>();
        result.put("message", "Questionnaire deleted successfully");
        return result;
    }
}