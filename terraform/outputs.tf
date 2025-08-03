output "alb_hostname" {
  description = "The hostname of the ALB"
  value       = aws_lb.main.dns_name
}

output "alb_url" {
  description = "The URL of the ALB"
  value       = "http://${aws_lb.main.dns_name}"
}

output "api_base_url" {
  description = "The base URL for the API"
  value       = "http://${aws_lb.main.dns_name}/api/v1"
}

output "vpc_id" {
  description = "ID of the VPC that was created"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.arn
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs.name
}

output "dynamodb_tables" {
  description = "Names of the DynamoDB tables"
  value = {
    patients     = aws_dynamodb_table.patients.name
    observations = aws_dynamodb_table.observations.name
    appointments = aws_dynamodb_table.appointments.name
  }
}

output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task.arn
}

output "target_group_arn" {
  description = "ARN of the target group"
  value       = aws_lb_target_group.app.arn
}

output "security_group_ids" {
  description = "Security group IDs"
  value = {
    alb       = aws_security_group.alb.id
    ecs_tasks = aws_security_group.ecs_tasks.id
  }
}