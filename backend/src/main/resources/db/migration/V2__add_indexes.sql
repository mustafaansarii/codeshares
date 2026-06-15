-- ============================================
-- Authentication & User Indexes
-- ============================================

-- auth_users table indexes
CREATE INDEX idx_auth_users_email ON auth_users(email);
CREATE INDEX idx_auth_users_created_at ON auth_users(created_at);
CREATE INDEX idx_auth_users_verified ON auth_users(verified);


-- ============================================
-- Problem & TestCase Indexes
-- ============================================

-- problem table indexes
CREATE INDEX idx_problem_sheet_name ON problem(sheet_name);
CREATE INDEX idx_problem_difficulty ON problem(difficulty);
CREATE INDEX idx_problem_created_at ON problem(created_at DESC);
CREATE INDEX idx_problem_updated_at ON problem(updated_at DESC);

-- test_case table indexes
CREATE INDEX idx_test_case_problem_id ON test_case(problem_id);
CREATE INDEX idx_test_case_is_sample ON test_case(is_sample);
CREATE INDEX idx_test_case_created_at ON test_case(created_at);
CREATE UNIQUE INDEX idx_test_case_problem_sample ON test_case(problem_id, is_sample);


-- ============================================
-- User Solution Indexes
-- ============================================

-- user_solution table indexes
CREATE INDEX idx_user_solution_user_id ON user_solution(user_id);
CREATE INDEX idx_user_solution_problem_id ON user_solution(problem_id);
CREATE UNIQUE INDEX idx_user_solution_user_problem ON user_solution(user_id, problem_id);
CREATE INDEX idx_user_solution_status ON user_solution(status);
CREATE INDEX idx_user_solution_user_status ON user_solution(user_id, status);
CREATE INDEX idx_user_solution_created_at ON user_solution(created_at DESC);
CREATE INDEX idx_user_solution_user_created_at ON user_solution(user_id, created_at DESC);


-- ============================================
-- Test Case Execution Indexes
-- ============================================

-- test_case_execution table indexes
CREATE INDEX idx_test_case_execution_solution_id ON test_case_execution(solution_id);
CREATE INDEX idx_test_case_execution_test_case_id ON test_case_execution(test_case_id);
CREATE INDEX idx_test_case_execution_status ON test_case_execution(status);
CREATE INDEX idx_test_case_execution_created_at ON test_case_execution(created_at);
CREATE UNIQUE INDEX idx_test_case_execution_solution_testcase ON test_case_execution(solution_id, test_case_id);


-- ============================================
-- Composite Indexes for Common Queries
-- ============================================

-- For filtering problems by sheet and difficulty
CREATE INDEX idx_problem_sheet_difficulty ON problem(sheet_name, difficulty);

-- For user's solved problems
CREATE INDEX idx_user_solution_user_accepted ON user_solution(user_id, status) WHERE status = 'ACCEPTED';

-- For user's attempts on a problem (timeline)
CREATE INDEX idx_user_solution_user_problem_created ON user_solution(user_id, problem_id, created_at DESC);

-- For problem statistics
CREATE INDEX idx_user_solution_problem_status ON user_solution(problem_id, status);

-- For test case execution results
CREATE INDEX idx_test_case_execution_solution_status ON test_case_execution(solution_id, status);
