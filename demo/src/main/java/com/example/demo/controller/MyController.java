package com.example.demo.controller;

import com.example.demo.service.Distribue;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class MyController {
    @GetMapping(value="moustache")
    @ResponseBody
    public String maMeth() {
        Distribue distribue = new Distribue();
        distribue.distribue();
        return distribue.outCartesHtml();
    }
}
