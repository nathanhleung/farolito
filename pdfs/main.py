from run_assistant import run_assistant 

def main():
    path_to_pdf = "assets/hawaii_medicaid.pdf"
    # path_to_pdf = "assets/idaho_medicaid.pdf"
    assistant_output = run_assistant(path_to_pdf)

    for output in assistant_output:
        if (output["action"] == "system_prompt"):
            print("System: " + output["system_prompt"])
        elif (output["action"] == "skip"):
            print(output["reason"])
        else:
            print(output)

main()