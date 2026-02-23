import fs from "fs";
import path from "path";
import { IJobPosting, IQuizSession } from "../models/database.models";

export class TemplateService {
  private template_dir: string;

  constructor(template_dir: string = "frontend") {
    this.template_dir = template_dir;
  }

  render_template(template_name: string, context: Record<string, any> = {}): string {
    try {
      const template_path = path.join(this.template_dir, template_name);
      
      if (!fs.existsSync(template_path)) {
        console.error(`Template not found: ${template_path}`);
        throw new Error(`Template '${template_name}' not found`);
      }
      
      let template_content = fs.readFileSync(template_path, "utf-8");
      
      // Replace placeholders if context provided
      if (context) {
        template_content = this._replace_placeholders(template_content, context);
      }
      
      console.log(`Successfully rendered template: ${template_name}`);
      return template_content;
    } catch (error: any) {
      console.error(`Error rendering template ${template_name}: ${error.message}`);
      throw error;
    }
  }

  private _replace_placeholders(template_content: string, context: Record<string, any>): string {
    try {
      for (const [key, value] of Object.entries(context)) {
        const triple_placeholder = `{{{${key}}}}`;
        const double_placeholder = `{{${key}}}`;
        
        let replacement: string;
        if (value === null || value === undefined) {
          replacement = "";
        } else if (typeof value === "boolean") {
          replacement = value ? "Yes" : "No";
        } else if (Array.isArray(value)) {
          if (key.toUpperCase() === "REQUIRED_SKILLS") {
            replacement = this._format_skills_list(value);
          } else {
            replacement = value.join(", ");
          }
        } else if (typeof value === "object") {
          replacement = JSON.stringify(value);
        } else {
          replacement = String(value);
        }
        
        // Replace triple-brace placeholders first
        template_content = template_content.replace(new RegExp(triple_placeholder, "g"), replacement);
        
        // Then replace double-brace placeholders
        template_content = template_content.replace(new RegExp(double_placeholder, "g"), replacement);
      }
      
      // Handle conditional sections
      template_content = this._handle_conditional_sections(template_content, context);
      
      return template_content;
    } catch (error: any) {
      console.error(`Error replacing placeholders: ${error.message}`);
      return template_content;
    }
  }

  private _format_skills_list(skills: string[]): string {
    if (!skills || skills.length === 0) {
      return "<li>No specific skills listed</li>";
    }
    
    return skills.map(skill => `<li>${skill}</li>`).join("\n");
  }

  private _handle_conditional_sections(template_content: string, context: Record<string, any>): string {
    // Handle additional details section
    if (context["ADDITIONAL_DETAILS"]) {
      const additional_section = `<div class="additional-details">
        <h3>Additional Information</h3>
        <p>${String(context["ADDITIONAL_DETAILS"]).replace(/\n/g, "<br>")}</p>
      </div>`;
      template_content = template_content.replace("{{ADDITIONAL_DETAILS}}", additional_section);
    } else {
      template_content = template_content.replace("{{ADDITIONAL_DETAILS}}", "");
    }
    
    // Handle HR contact section
    if (context["HR_NAME"]) {
      const hr_section = `<div class="hr-contact">
        <h3>Contact</h3>
        <p>👤 ${context["HR_NAME"]}</p>
      </div>`;
      template_content = template_content.replace("{{HR_CONTACT}}", hr_section);
    } else {
      template_content = template_content.replace("{{HR_CONTACT}}", "");
    }
    
    return template_content;
  }

  render_job_application_page(job_posting: IJobPosting): string {
    try {
      const context = {
        JOB_ID: job_posting.job_id,
        JOB_TITLE: job_posting.title,
        JOB_DESCRIPTION: job_posting.description.replace(/\n/g, "<br>"),
        REQUIRED_SKILLS: job_posting.required_skills,
        ADDITIONAL_DETAILS: job_posting.additional_details,
        HR_NAME: job_posting.hr_name
      };
      
      return this.render_template("job-application.html", context);
    } catch (error: any) {
      console.error(`Error rendering job application page: ${error.message}`);
      throw error;
    }
  }

  render_quiz_page(quiz_session: IQuizSession, job_title: string = "Skills Assessment", application_id?: string): string {
    try {
      // Prepare quiz questions HTML
      let questions_html = "";
      for (let i = 0; i < quiz_session.questions.length; i++) {
        const question_data = quiz_session.questions[i] as any;
        let options_html = "";
        
        for (let j = 0; j < question_data.options.length; j++) {
          options_html += `
          <div class="option" onclick="document.getElementById('q${i}_a${j}').checked=true; saveAnswer(${i}, ${j})">
            <input type="radio" id="q${i}_a${j}" name="question_${i}" value="${j}">
            <label for="q${i}_a${j}">${question_data.options[j]}</label>
          </div>`;
        }
        
        questions_html += `
        <div class="question" data-question="${i}">
          <h4>Question ${i + 1}: ${question_data.question}</h4>
          <div class="options">
            ${options_html}
          </div>
        </div>`;
      }
      
      const context = {
        JOB_TITLE: job_title,
        TIME_LIMIT: Math.floor(quiz_session.time_limit_seconds / 60),
        TOTAL_QUESTIONS: quiz_session.questions.length,
        PASS_THRESHOLD: quiz_session.pass_threshold,
        QUIZ_QUESTIONS: questions_html,
        QUIZ_DATA: JSON.stringify(
          quiz_session.questions.map((q: any) => {
            const { correct_answer: _omit, ...rest } = q;
            return rest;
          })
        ),
        CANDIDATE_EMAIL: quiz_session.candidate_email || "",
        APPLICATION_ID: application_id || ""
      };
      
      return this.render_template("quiz-page.html", context);
    } catch (error: any) {
      console.error(`Error rendering quiz page: ${error.message}`);
      throw error;
    }
  }

  get_error_page(error_type: string): string {
    try {
      const error_templates: Record<string, string> = {
        not_found: "job-not-found.html",
        inactive: "job-inactive.html",
        server_error: "error-500.html"
      };
      
      const template_name = error_templates[error_type] || "job-not-found.html";
      return this.render_template(template_name);
    } catch (error: any) {
      console.error(`Error getting error page: ${error.message}`);
      return this._get_fallback_error_html(error_type);
    }
  }

  private _get_fallback_error_html(error_type: string): string {
    const error_messages: Record<string, string> = {
      not_found: "Job posting not found",
      inactive: "Job posting is no longer active",
      server_error: "An error occurred while loading this page"
    };
    
    const message = error_messages[error_type] || "An error occurred";
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - ATS System</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 10px; }
    </style>
</head>
<body>
    <div class="error">
        <h1>Error</h1>
        <p>${message}</p>
        <button onclick="window.location.href='/'">Go Home</button>
    </div>
</body>
</html>`;
  }
}

