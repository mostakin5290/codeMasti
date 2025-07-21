const codeWrapperTemplates = {
    javascript: `// User's function will be inserted here
{{USER_CODE}}

// Input processing and execution
try {
    const rawTestInput = '{{TEST_INPUT}}';
    let parsedInput;
    try {
        parsedInput = JSON.parse(rawTestInput);
    } catch (e) {
        parsedInput = rawTestInput;
    }

    let result;
    const functionToCall = {{FUNCTION_NAME}};

    if ('{{INPUT_FORMAT}}' === 'array') {
        result = functionToCall(...parsedInput);
    } else if ('{{INPUT_FORMAT}}' === 'single' || '{{INPUT_FORMAT}}' === 'string') {
        result = functionToCall(parsedInput);
    } else if ('{{INPUT_FORMAT}}' === 'object') {
        result = functionToCall(parsedInput);
    } else {
        result = functionToCall(parsedInput);
    }
    
    console.log(JSON.stringify(result));
} catch (error) {
    console.error("RUNTIME_ERROR:", error.toString());
    console.error("STACK_TRACE:", error.stack);
}`,
    python: `# User's function will be inserted here
{{USER_CODE}}

# Input processing and execution
import json
import sys

try:
    test_input_str = '{{TEST_INPUT}}'
    parsed_input = None
    try:
        parsed_input = json.loads(test_input_str)
    except json.JSONDecodeError:
        parsed_input = test_input_str

    if 'Solution' in globals():
        solution_instance = Solution()
        function_to_call = getattr(solution_instance, "{{FUNCTION_NAME}}")
    else:
        function_to_call = globals()["{{FUNCTION_NAME}}"]

    result = None
    if '{{INPUT_FORMAT}}' == 'array':
        result = function_to_call(*parsed_input)
    elif '{{INPUT_FORMAT}}' == 'single' or '{{INPUT_FORMAT}}' == 'string':
        result = function_to_call(parsed_input)
    elif '{{INPUT_FORMAT}}' == 'object':
        result = function_to_call(parsed_input)
    else:
        result = function_to_call(parsed_input)
    
    print(json.dumps(result))

except Exception as e:
    print(f"RUNTIME_ERROR: {str(e)}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)`,
    
    // **THIS IS THE CRITICAL CHANGE FOR JAVA**
    java: `import java.util.*;

public class Main {
    // This is the static nested class where the user's methods will be placed.
    // **IMPORTANT**: The user's submitted 'code' for Java should now ONLY contain
    // the method(s), NOT the 'public class Solution { ... }' wrapper.
    public static class Solution {
        {{USER_CODE}}
    }

    public static void main(String[] args) {
        try {
            String inputJson = "{{TEST_INPUT}}";
            // Instantiate the static nested Solution class
            Solution solution = new Solution(); 
            
            {{DYNAMIC_INPUT_PARSING_AND_METHOD_CALL}}
            
        } catch (Exception e) {
            System.err.println("RUNTIME_ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // Helper method to parse simple JSON-like structures
    private static Object parseValue(String value) {
        value = value.trim();
        if (value.equals("null")) return null;
        if (value.equals("true")) return true;
        if (value.equals("false")) return false;
        if (value.startsWith("\\\"") && value.endsWith("\\\"")) { 
            return value.substring(1, value.length() - 1);
        }
        if (value.startsWith("[") && value.endsWith("]")) {
            return parseArray(value);
        }
        try {
            if (value.contains(".")) {
                return Double.parseDouble(value);
            } else {
                return Integer.parseInt(value);
            }
        } catch (NumberFormatException e) {
            return value;
        }
    }
    
    private static List<Object> parseArray(String arrayStr) {
        List<Object> result = new ArrayList<>();
        String content = arrayStr.substring(1, arrayStr.length() - 1).trim();
        if (content.isEmpty()) return result;
        
        String[] elements = content.split(",(?=(?:[^\\\"]*\\\"[^\\\"]*\\\")*[^\\\"]*$)");
        for (String element : elements) {
            result.add(parseValue(element.trim()));
        }
        return result;
    }
    
    private static int[] parseIntArray(String arrayStr) {
        List<Object> list = parseArray(arrayStr);
        int[] result = new int[list.size()];
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i) instanceof Integer) {
                result[i] = (Integer) list.get(i);
            } else if (list.get(i) instanceof Double) {
                result[i] = ((Double) list.get(i)).intValue();
            } else {
                throw new IllegalArgumentException("Expected integer but got: " + list.get(i));
            }
        }
        return result;
    }
    
    private static String formatOutput(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof String) return "\\\"" + obj + "\\\""; 
        if (obj instanceof Boolean || obj instanceof Number) return obj.toString();
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(formatOutput(list.get(i)));
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof int[]) {
            int[] arr = (int[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(arr[i]);
            }
            sb.append("]");
            return sb.toString();
        }
        return obj.toString();
    }
}`,

    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm> // For std::transform
#include <stdexcept> // For std::invalid_argument, std::exception

// DO NOT INCLUDE <nlohmann/json.hpp> or any other external JSON library.
// Judge0 does not have them pre-installed.

// User's code will be injected here by the backend
// It is wrapped inside a Solution class for consistent calling.
class Solution {
public:
{{USER_CODE}}
};

// A simple, self-contained parser to handle the basic input formats.
// This parser does not require any external libraries.
class SimpleParser {
public:
    static std::vector<int> parseIntArray(const std::string& str) {
        std::vector<int> result;
        if (str.length() < 2 || str.front() != '[' || str.back() != ']') {
            // Handle cases where the input is not a valid array string, e.g., "123"
            try {
                result.push_back(std::stoi(str));
            } catch (const std::invalid_argument& ia) {
                // Not a number, return empty vector or throw error
            }
            return result;
        }

        std::string content = str.substr(1, str.length() - 2);
        if (content.empty()) {
            return result;
        }

        std::stringstream ss(content);
        std::string item;
        while (std::getline(ss, item, ',')) {
            try {
                result.push_back(std::stoi(item));
            } catch (const std::invalid_argument& ia) {
                // Could not convert item to int, skip or handle error
            }
        }
        return result;
    }
    
    static std::string parseString(const std::string& str) {
        if (str.length() >= 2 && str.front() == '"' && str.back() == '"') {
            return str.substr(1, str.length() - 2);
        }
        return str;
    }
    
    static int parseInt(const std::string& str) {
        return std::stoi(str);
    }
    
    static double parseDouble(const std::string& str) {
        return std::stod(str);
    }
    
    static bool parseBool(const std::string& str) {
        std::string lowerStr = str;
        std::transform(lowerStr.begin(), lowerStr.end(), lowerStr.begin(), ::tolower);
        return lowerStr == "true";
    }
};

// --- Helper functions to print various result types in a consistent JSON format ---
template<typename T>
void printResult(const T& result) {
    std::cout << result;
}

template<>
void printResult<std::vector<int>>(const std::vector<int>& result) {
    std::cout << "[";
    for (size_t i = 0; i < result.size(); ++i) {
        std::cout << result[i];
        if (i < result.size() - 1) {
            std::cout << ",";
        }
    }
    std::cout << "]";
}

template<>
void printResult<std::string>(const std::string& result) {
    std::cout << "\"" << result << "\"";
}

template<>
void printResult<bool>(const bool& result) {
    std::cout << (result ? "true" : "false");
}

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    std::string input_str = R"({{TEST_INPUT}})";
    
    try {
        // The backend will generate the specific parsing and function call code here
        {{DYNAMIC_INPUT_PARSING_AND_METHOD_CALL}}
    } catch (const std::exception& e) {
        std::cerr << "RUNTIME_ERROR: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}`
    ,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

{{USER_CODE}}

// Helper functions for parsing
int parseInt(const char* str) {
    return atoi(str);
}

double parseDouble(const char* str) {
    return atof(str);
}

// Simple array parser for integers
int* parseIntArray(const char* str, int* size) {
    int* result = malloc(100 * sizeof(int));
    *size = 0;
    
    char* copy = strdup(str);
    char* token = strtok(copy + 1, ",]");
    
    while (token != NULL) {
        result[*size] = atoi(token);
        (*size)++;
        token = strtok(NULL, ",]");
    }
    
    free(copy);
    return result;
}

void printIntArray(int* arr, int size) {
    printf("[");
    for (int i = 0; i < size; i++) {
        if (i > 0) printf(",");
        printf("%d", arr[i]);
    }
    printf("]\\n");
}

int main() {
    char input_str[] = "{{TEST_INPUT}}";
    
    {{DYNAMIC_INPUT_PARSING_AND_METHOD_CALL}}

    return 0;
}`
};

module.exports = codeWrapperTemplates;