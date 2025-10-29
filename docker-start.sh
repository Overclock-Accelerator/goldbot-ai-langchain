#!/bin/bash

# GoldBot AI - Docker Quick Start Script
# This script provides an easy way to start the application with Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed or is an old version."
        echo "Please install Docker Compose v2.0+"
        exit 1
    fi
    print_success "Docker Compose is installed"
}

# Check if .env.local exists
check_env_file() {
    if [ ! -f .env.local ]; then
        print_error ".env.local file not found!"
        echo ""
        echo "Please create .env.local with the following variables:"
        echo "ANTHROPIC_API_KEY=sk-ant-..."
        echo "GOLDAPI_KEY=goldapi-..."
        echo "LANGSMITH_API_KEY=lsv2_pt_... (optional)"
        echo "LANGSMITH_TRACING_V2=true (optional)"
        echo "LANGSMITH_PROJECT=goldbot-ai (optional)"
        exit 1
    fi
    print_success ".env.local file exists"
}

# Check if ports are available
check_ports() {
    local ports=(2024 3002)
    local occupied=()

    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            occupied+=($port)
        fi
    done

    if [ ${#occupied[@]} -gt 0 ]; then
        print_warning "The following ports are already in use: ${occupied[*]}"
        echo ""
        echo "Would you like to stop the processes using these ports? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            for port in "${occupied[@]}"; do
                print_info "Killing processes on port $port..."
                lsof -ti:$port | xargs kill -9 2>/dev/null || true
            done
            print_success "Ports freed"
        else
            print_error "Cannot start services with occupied ports"
            exit 1
        fi
    else
        print_success "Ports 2024 and 3002 are available"
    fi
}

# Display help
show_help() {
    cat << EOF
GoldBot AI - Docker Quick Start

Usage: ./docker-start.sh [OPTION]

Options:
  --dev           Start development environment (default)
  --prod          Start production environment with persistence
  --stop          Stop all services
  --restart       Restart all services
  --logs          View logs
  --clean         Stop and remove all containers and volumes
  --build         Rebuild images and start services
  --help          Display this help message

Examples:
  ./docker-start.sh                    # Start development environment
  ./docker-start.sh --prod             # Start production environment
  ./docker-start.sh --logs             # View service logs
  ./docker-start.sh --clean            # Clean up everything

EOF
}

# Start development environment
start_dev() {
    print_info "Starting development environment..."
    docker compose up -d

    print_info "Waiting for services to be healthy..."
    sleep 5

    # Check health
    if docker compose ps | grep -q "unhealthy"; then
        print_warning "Some services are unhealthy. Check logs with: docker compose logs -f"
    else
        print_success "All services are running!"
    fi

    echo ""
    echo "🌐 Access URLs:"
    echo "   - Next.js App: http://localhost:3002"
    echo "   - LangGraph API: http://localhost:2024"
    echo "   - LangGraph Studio: https://smith.langchain.com/studio?baseUrl=http://localhost:2024"
    echo ""
    echo "📋 Useful commands:"
    echo "   - View logs: docker compose logs -f"
    echo "   - Stop services: docker compose down"
    echo "   - Restart: docker compose restart"
}

# Start production environment
start_prod() {
    print_info "Starting production environment with persistence..."
    docker compose -f docker-compose.prod.yml up -d

    print_info "Waiting for services to be healthy..."
    sleep 10

    # Check health
    if docker compose -f docker-compose.prod.yml ps | grep -q "unhealthy"; then
        print_warning "Some services are unhealthy. Check logs with: docker compose -f docker-compose.prod.yml logs -f"
    else
        print_success "All services are running!"
    fi

    echo ""
    echo "🌐 Access URLs:"
    echo "   - Next.js App: http://localhost:3002"
    echo "   - LangGraph API: http://localhost:2024"
    echo "   - Redis: localhost:6379"
    echo "   - PostgreSQL: localhost:5432"
    echo ""
    echo "📋 Useful commands:"
    echo "   - View logs: docker compose -f docker-compose.prod.yml logs -f"
    echo "   - Stop services: docker compose -f docker-compose.prod.yml down"
}

# Stop services
stop_services() {
    print_info "Stopping services..."
    if [ -f docker-compose.prod.yml ] && docker compose -f docker-compose.prod.yml ps -q | grep -q .; then
        docker compose -f docker-compose.prod.yml down
    fi
    if docker compose ps -q | grep -q .; then
        docker compose down
    fi
    print_success "Services stopped"
}

# Restart services
restart_services() {
    print_info "Restarting services..."
    if [ -f docker-compose.prod.yml ] && docker compose -f docker-compose.prod.yml ps -q | grep -q .; then
        docker compose -f docker-compose.prod.yml restart
        print_success "Production services restarted"
    elif docker compose ps -q | grep -q .; then
        docker compose restart
        print_success "Development services restarted"
    else
        print_warning "No running services found"
    fi
}

# View logs
view_logs() {
    if [ -f docker-compose.prod.yml ] && docker compose -f docker-compose.prod.yml ps -q | grep -q .; then
        docker compose -f docker-compose.prod.yml logs -f
    elif docker compose ps -q | grep -q .; then
        docker compose logs -f
    else
        print_error "No running services found"
    fi
}

# Clean up everything
clean_all() {
    print_warning "This will remove all containers, volumes, and data. Are you sure? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker compose down -v 2>/dev/null || true
        docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true
        print_success "Cleanup complete"
    else
        print_info "Cleanup cancelled"
    fi
}

# Build and start
build_and_start() {
    print_info "Building images..."
    docker compose build
    print_success "Build complete"
    start_dev
}

# Main script
main() {
    print_info "GoldBot AI - Docker Quick Start"
    echo ""

    case "${1:-}" in
        --help|-h)
            show_help
            exit 0
            ;;
        --prod)
            check_docker
            check_docker_compose
            check_env_file
            check_ports
            start_prod
            ;;
        --stop)
            stop_services
            ;;
        --restart)
            restart_services
            ;;
        --logs)
            view_logs
            ;;
        --clean)
            clean_all
            ;;
        --build)
            check_docker
            check_docker_compose
            check_env_file
            check_ports
            build_and_start
            ;;
        --dev|"")
            check_docker
            check_docker_compose
            check_env_file
            check_ports
            start_dev
            ;;
        *)
            print_error "Unknown option: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
