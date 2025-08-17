#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Fake-End E2E Test Suite (Risk-Driven)${NC}"
echo -e "${BLUE}===========================================${NC}"

echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Bun is required but not installed.${NC}"
    exit 1
fi

echo -e "${YELLOW}Building project...${NC}"
if ! bun run build; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    bun install
fi

echo -e "${YELLOW}Cleaning up existing processes...${NC}"
pkill -f "fake-end" || true
pkill -f "bin.cjs" || true
sleep 1

export NODE_ENV=test
export TEST_MODE=true

echo -e "${YELLOW}Running focused E2E tests...${NC}"

CATEGORIES=(
    "Core Functionality"
    "TypeScript Interface Support"
    "File Watching & Hot Reload"
    "CLI Core Operations"
    "Error Scenarios & Edge Cases"
    "Performance Critical Scenarios"
)

echo -e "${BLUE}Test Categories (Risk-Driven):${NC}"
for i in "${!CATEGORIES[@]}"; do
    echo -e "${BLUE}  $((i+1)). ${CATEGORIES[i]}${NC}"
done

echo ""

if bun test:e2e --detectOpenHandles --forceExit; then
    echo -e "${GREEN}✅ All E2E tests passed!${NC}"
    
    echo -e "${GREEN}===========================================${NC}"
    echo -e "${GREEN}🎉 Test Suite Summary${NC}"
    echo -e "${GREEN}===========================================${NC}"
    echo -e "${GREEN}✅ Core Functionality: PASSED${NC}"
    echo -e "${GREEN}✅ TypeScript Interface Support: PASSED${NC}"
    echo -e "${GREEN}✅ File Watching & Hot Reload: PASSED${NC}"
    echo -e "${GREEN}✅ CLI Core Operations: PASSED${NC}"
    echo -e "${GREEN}✅ Error Scenarios & Edge Cases: PASSED${NC}"
    echo -e "${GREEN}✅ Performance Critical Scenarios: PASSED${NC}"
    echo ""
    echo -e "${GREEN}🏆 All critical user workflows verified!${NC}"
    
    exit 0
else
    echo -e "${RED}❌ Some E2E tests failed${NC}"
    echo -e "${YELLOW}Note: Failures in this focused suite indicate real issues that affect users${NC}"
    
    # Cleanup on failure
    echo -e "${YELLOW}Cleaning up after test failure...${NC}"
    pkill -f "fake-end" || true
    pkill -f "bin.cjs" || true
    
    exit 1
fi